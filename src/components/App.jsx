import React, { Component } from 'react';
import './App.css';
import UserList from '../containers/UserListPanel'
import MenuButtonGroup from '../containers/MenuButtonGroupPanel'
import { showInitialStartupModalActionCreator } from '../actions/initialStartupModal';
import InitialStartupModal from '../containers/InitialStartupModalPanel';
import Loading from './Loading'
import store from '../store/configureStore';
import { loginAction, getUserListAction, updateUserInfoAction, getNotificationAction, sendHeartbeatAction } from '../actions/userList';
import { AUTH_REQUEST_HEADERS, HEARTBEAT_INTERVAL_MS } from '../define';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();

class App extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const userID = electronStore.get('userID');

    document.cookie = 'isConnected=true';

    dispatch(loginAction())
      .then(
        () => {
          const statusCode = store.getState().userList.isError.code;
          if (statusCode === 401) {
            remote.dialog.showMessageBox(remote.getCurrentWindow(), {
              title: '行き先掲示板',
              type: 'info',
              buttons: ['OK'],
              message: '認証に失敗しました。',
            });
            return;
          }

          // APIリクエストヘッダに認証トークンを設定する
          AUTH_REQUEST_HEADERS['Authorization'] = 'Bearer ' + store.getState().userList.token;

          // お知らせチェック
          dispatch(getNotificationAction())
            .then(
              () => {
                const isError = store.getState().userList.isError;
                if (isError.status) {
                  return;
                }

                const notification = store.getState().userList.notification;

                const options = {
                  title: '行き先掲示板',
                  type: 'info',
                  buttons: ['OK'],
                  message: `新しい行き先掲示板が公開されました。\nVersion ${notification.latestAppVersion}\nお手数ですがアップデートをお願いします。`,
                };

                // バージョンチェック
                remote.session.defaultSession.cookies.get({ name: 'version' })
                  .then((cookies) => {
                    if (notification.latestAppVersion !== cookies[0].value) {
                      remote.dialog.showMessageBox(remote.getCurrentWindow(), options);
                    }
                  })
                  .catch((error) => {
                    remote.dialog.showMessageBox(remote.getCurrentWindow(), options);
                  });

                if (notification.content === '') {
                  return;
                }

                if (notification.targetIDs.includes(userID)) {
                  remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                    title: '行き先掲示板',
                    type: 'info',
                    buttons: ['OK'],
                    message: notification.content,
                  });
                }
              }
            );

          setInterval(this._heartbeat, HEARTBEAT_INTERVAL_MS);

          /**
           * 初回起動チェック
           * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
           */
          if (!userID) {
            this._showModal();
            return;
          }

          dispatch(getUserListAction())
            .then(
              () => {
                const userList = store.getState().userList['userList'];
                const userInfo = this._getUserInfo(userList, userID);
                const userInfoLength = Object.keys(userInfo).length;
                const isError = store.getState().userList.isError;

                if (isError.status === false && userInfoLength === 0) {
                  remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                    title: '行き先掲示板',
                    type: 'info',
                    buttons: ['OK'],
                    message: 'ユーザ情報が存在しません。\nユーザ登録を行います。',
                  });
                  dispatch(showInitialStartupModalActionCreator());
                  return;
                }

                const updatedUserInfo = {};
                updatedUserInfo['id'] = userID;

                remote.session.defaultSession.cookies.get({ name: 'version' })
                  .then((cookies) => {
                    if (cookies[0]) {
                      updatedUserInfo['version'] = cookies[0].value;
                    }

                    // 状態が「退社」のユーザのみ、状態を「在席」に変更して情報を初期化
                    if (userInfo['status'] === '退社') {
                      updatedUserInfo['status'] = '在席';
                      updatedUserInfo['destination'] = '';
                      updatedUserInfo['return'] = '';
                    }

                    Object.assign(userInfo, updatedUserInfo);

                    dispatch(updateUserInfoAction(updatedUserInfo, userID));
                    this._heartbeat();
                  });
              }
            );
        }
      );
  }

  _showModal = () => {
    const { dispatch } = this.props;
    dispatch(showInitialStartupModalActionCreator());
  }

  _getUserInfo = (userList, userID) => {
    if (!userList) {
      return {};
    }
    const userInfo = userList
      .filter(userInfo => {
        return userInfo['id'] === userID;
      })[0];
    return userInfo || {};
  }

  _heartbeat = () => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userList['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;

    if (userInfoLength === 0) {
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo['heartbeat'] = "";
    dispatch(sendHeartbeatAction(updatedUserInfo, userID));
  }

  updateInfo = ipcRenderer.on('updateInfo', (event, key, value) => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userList['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    if (userInfoLength === 0 || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo[key] = value;
    Object.assign(userInfo, updatedUserInfo);
    dispatch(updateUserInfoAction(updatedUserInfo, userID))
  });

  appClose = ipcRenderer.on('appClose', (event) => {
    const { dispatch } = this.props;

    const userID = electronStore.get('userID');
    const userList = store.getState().userList['userList'];
    const userInfo = this._getUserInfo(userList, userID);
    const userInfoLength = Object.keys(userInfo).length;
    if (userInfoLength === 0 || ['在席', '在席 (離席中)'].includes(userInfo['status']) === false) {
      ipcRenderer.send('close');
      return;
    }

    const updatedUserInfo = {};
    updatedUserInfo['id'] = userID;
    updatedUserInfo['status'] = '退社';
    Object.assign(userInfo, updatedUserInfo);
    dispatch(updateUserInfoAction(updatedUserInfo, userID))
      .then(() => ipcRenderer.send('close'));
  });

  render() {
    const isFetching = store.getState().userList.isFetching;

    return (
      <div>
        {electronStore.get('userID') &&
          <div>
            <UserList />
            <MenuButtonGroup />
          </div>
        }
        <InitialStartupModal />
        <Loading isFetching={isFetching} />
      </div>
    );
  }
}

export default App;
