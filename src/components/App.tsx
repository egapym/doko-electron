import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { ThemeProvider as MaterialThemeProvider } from '@material-ui/styles';
import React from 'react';
import { connect } from 'react-redux';
import {
  APP_DOWNLOAD_URL,
  APP_NAME,
  APP_VERSION,
  AUTH_REQUEST_HEADERS,
  HEARTBEAT_INTERVAL_MS,
  SAVE_INSTALLER_FILENAME,
  USER_STATUS
} from '../define';
import { ApiResponse, Notification, UserInfo, Props } from '../define/model';
import AppModule, { AsyncActionsApp } from '../modules/appModule';
import InitialStartupModalModule from '../modules/initialStartupModalModule';
import { AsyncActionsOfficeInfo } from '../modules/officeInfo/officeInfoModule';
import UserListModule, { AsyncActionsUserList } from '../modules/userInfo/userListModule';
import './App.scss';
import { getUserInfo, sendHeartbeat, showMessageBox, showMessageBoxWithReturnValue } from './common/functions';
import InitialStartupModal from './InitialStartupModal';
import Loading from './Loading';
import { tabTheme } from './materialui/theme';
import MenuButtonGroupForOfficeInfo from './officeInfo/MenuButtonGroupForOfficeInfo';
import OfficeInfo from './officeInfo/OfficeInfo';
import Progress from './Progress';
import Settings from './settings/Settings';
import MenuButtonGroupForUserList from './userInfo/MenuButtonGroupForUserList';
import UserList from './userInfo/UserList';
import { Fade } from '@material-ui/core';

const { remote, ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();
const childProcess = window.require('child_process');
const path = require('path');

class App extends React.Component<Props, any> {
  async componentDidMount() {
    const { dispatch } = this.props;
    const userID: number = (electronStore.get('userID') as number | undefined) || -1;
    let response: ApiResponse;

    // メインプロセスに、WEBアプリケーションに接続できたことを伝える
    ipcRenderer.send('connected', true);

    response = await dispatch(AsyncActionsApp.loginAction());

    if (response.getIsError()) {
      ipcRenderer.send('connected', false);
      remote.getCurrentWindow().loadFile(remote.getGlobal('errorPageFilepath'));
      return;
    }

    // APIリクエストヘッダに認証トークンを設定する
    AUTH_REQUEST_HEADERS['Authorization'] = 'Bearer ' + this.props.state.appState.token;

    // お知らせチェック
    await dispatch(AsyncActionsApp.getNotificationAction());

    const notification: Notification = this.props.state.appState.notification;
    const updateNotificationMessage: string = `新しい${APP_NAME}が公開されました。\nVersion ${notification.latestAppVersion}\nお手数ですがアップデートをお願いします。`;

    /**
     * バージョンチェック
     * 実行しているアプリケーションのバージョンが最新ではない場合、
     * 自動的に規定のブラウザでダウンロード先URLを開き、アプリケーションを終了する
     */
    if (notification.latestAppVersion !== APP_VERSION) {
      showMessageBox(updateNotificationMessage);
      remote.shell.openExternal(APP_DOWNLOAD_URL);
      remote.getCurrentWindow().destroy();
      return;
    }

    // if (notification.latestAppVersion !== APP_VERSION) {
    //   dispatch(AppModule.actions.setUpdatingStatus(true));
    //   const index = showMessageBoxWithReturnValue('OK', 'Cancel', updateNotificationMessage);
    //   this._updateApp(index);
    //   return;
    // }

    /**
     * スタートアップ登録処理。
     * スタートアップ登録のダイアログを表示する（ダイアログ表示は1度きり）
     */
    if (!electronStore.get('startup.notified')) {
      const index = showMessageBoxWithReturnValue(
        'YES',
        'NO',
        `スタートアップを有効にしますか？\n※PCを起動した際に自動的に${APP_NAME}が起動します。`
      );
      let openAtLogin;

      switch (index) {
        // ダイアログで「OK」を選択した場合
        case 0:
          openAtLogin = true;
          break;

        // ダイアログで「OK」以外を選択した場合
        default:
          openAtLogin = false;
          break;
      }

      electronStore.set('startup.notified', 1);

      remote.app.setLoginItemSettings({
        openAtLogin,
        path: remote.app.getPath('exe')
      });
    }

    /**
     * お知らせチェック
     * appVersion が latestAppVersion と異なる場合、アップデート後の初回起動と判断し、
     * 一度だけお知らせを表示する。
     */
    if (electronStore.get('appVersion') !== APP_VERSION) {
      showMessageBox(notification.content);
      electronStore.set('appVersion', APP_VERSION);
    }

    /**
     * アプリケーションの死活監視のため、定期的にサーバにリクエストを送信する
     */
    setInterval(() => {
      sendHeartbeat(dispatch);
    }, HEARTBEAT_INTERVAL_MS);

    /**
     * 初回起動チェック
     * 設定ファイルが存在しない、もしくはuserIDが設定されていない場合は登録画面を表示する
     */
    if (userID === -1) {
      dispatch(InitialStartupModalModule.actions.showModal(true));
      return;
    }

    response = await dispatch(AsyncActionsUserList.getUserListAction(userID));
    if (response.getIsError()) {
      return;
    }

    const userList: UserInfo[] = JSON.parse(JSON.stringify(this.props.state.userListState.userList));
    const userInfo = getUserInfo(userList, userID);

    /**
     * サーバ上に自分の情報が存在するかどうかチェック
     * 無ければ新規登録画面へ遷移する
     */
    if (userInfo === null) {
      return;
    }

    const updatedUserInfo: any = {};
    updatedUserInfo['id'] = userID;
    if (userInfo['version'] !== APP_VERSION) {
      updatedUserInfo['version'] = APP_VERSION;
      // アプリバージョンのみ更新（更新日時も更新されない）
      dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, userID));
    }

    // 状態を「在席」に更新する（更新日時も更新される）
    if (
      userInfo['status'] === USER_STATUS.s02 ||
      userInfo['status'] === USER_STATUS.s01 ||
      userInfo['status'] === USER_STATUS.s13
    ) {
      userInfo['status'] = USER_STATUS.s01;
      updatedUserInfo['status'] = userInfo['status'];
      updatedUserInfo['name'] = userInfo['name'];
      dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, userID));
    }

    dispatch(UserListModule.actions.setUserInfo(userList));
    dispatch(AppModule.actions.setMyUserId(userID));

    sendHeartbeat(dispatch);
  }

  electronMinimizeEvent = ipcRenderer.on('electronMinimizeEvent', () => {
    remote.getCurrentWindow().hide();
  });

  // 状態を「離席中」に更新する
  electronLockScreenEvent = ipcRenderer.on('electronLockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState['myUserID'];
    const userList = this.props.state.userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || [USER_STATUS.s01, USER_STATUS.s13].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo = { ...userInfo };
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['name'] = userInfo['name'];
    updatedUserInfo['status'] = USER_STATUS.s13;
    dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
  });

  // 状態を「在席」に更新する
  electronUnlockScreenEvent = ipcRenderer.on('electronUnlockScreenEvent', () => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState['myUserID'];
    const userList = this.props.state.userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || [USER_STATUS.s01, USER_STATUS.s13].includes(userInfo['status']) === false) {
      return;
    }

    const updatedUserInfo = { ...userInfo };
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['name'] = userInfo['name'];
    updatedUserInfo['status'] = USER_STATUS.s01;
    dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));

    sendHeartbeat(dispatch);
  });

  closeApp = ipcRenderer.on('closeApp', async (event: any) => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState['myUserID'];
    const userList = this.props.state.userListState['userList'];
    const userInfo = getUserInfo(userList, myUserID);
    if (userInfo === null || [USER_STATUS.s01, USER_STATUS.s13].includes(userInfo['status']) === false) {
      ipcRenderer.send('close');
      return;
    }

    const updatedUserInfo = { ...userInfo };
    updatedUserInfo['id'] = myUserID;
    updatedUserInfo['status'] = USER_STATUS.s02;
    updatedUserInfo['name'] = userInfo['name'];
    await dispatch(AsyncActionsUserList.updateUserInfoAction(updatedUserInfo, myUserID));
    ipcRenderer.send('close');
  });

  updateOnProgress = ipcRenderer.on('updateOnProgress', (event: any, receivedBytes: number) => {
    const { dispatch } = this.props;
    const updateInstallerFileByteSize = this.props.state.appState.updateInstallerFileByteSize;
    dispatch(AppModule.actions.setDownloadProgress(Math.round((receivedBytes / updateInstallerFileByteSize) * 1000) / 10));
    dispatch(AppModule.actions.setReceivedBytes(receivedBytes));
  });

  updateInstallerDownloadOnSccess = ipcRenderer.on('updateInstallerDownloadOnSccess', (event: any, savePath: string) => {
    try {
      switch (remote.process.platform) {
        case 'win32':
          childProcess.execFileSync(savePath);
          break;

        case 'darwin':
          childProcess.execSync(`open ${savePath}`);
          break;

        default:
          break;
      }

      remote.getCurrentWindow().destroy();
    } catch (error) {
      showMessageBox(`${APP_NAME}インストーラの実行に失敗しました。`, 'warning');
      remote.getCurrentWindow().destroy();
      return;
    }
  });

  updateInstallerDownloadOnFailed = ipcRenderer.on('updateInstallerDownloadOnFailed', (event: any, errorMessage: string) => {
    const index = showMessageBoxWithReturnValue('OK', 'Cancel', `アップデートに失敗しました。\n再開しますか？`, 'warning');
    this._updateApp(index);
  });

  async _updateApp(index: number) {
    if (index !== 0) {
      remote.getCurrentWindow().destroy();
      return;
    }

    const { dispatch } = this.props;
    const notification: Notification = this.props.state.appState.notification;
    let fileName = '';

    switch (remote.process.platform) {
      case 'win32':
        fileName = notification.updateInstaller.windows.fileName;
        installAndUpdate(fileName, 'exe');
        break;

      case 'darwin':
        fileName = notification.updateInstaller.mac.fileName;
        installAndUpdate(fileName, 'pkg');
        break;

      default:
        showMessageBox(`使用しているPCはアップデートに対応していません。`, 'warning');
        remote.getCurrentWindow().destroy();
        break;
    }

    async function installAndUpdate(fileName: string, fileExtension: string) {
      let response: ApiResponse;
      response = await dispatch(AsyncActionsApp.getS3SignedUrlAction(fileName));
      if (response.getIsError()) {
        showMessageBox(`${APP_NAME}インストーラのダウンロードに失敗しました。`, 'warning');
        remote.getCurrentWindow().destroy();
        return;
      }
      const url = response.getPayload();

      response = await dispatch(AsyncActionsApp.getS3ObjectFileByteSizeAction(fileName));
      if (response.getIsError()) {
        showMessageBox(`${APP_NAME}インストーラのダウンロードに失敗しました。`, 'warning');
        remote.getCurrentWindow().destroy();
        return;
      }

      const updateInstallerFilepath = `${path.join(
        remote.app.getPath('temp'),
        SAVE_INSTALLER_FILENAME
      )}_${APP_VERSION}.${fileExtension}`;
      ipcRenderer.send('updateApp', updateInstallerFilepath, url);
    }
  }

  handleActiveIndexUpdate = async (event: React.ChangeEvent<{}>, activeIndex: number) => {
    const { dispatch } = this.props;
    const myUserID = this.props.state.appState.myUserID;
    dispatch(AppModule.actions.setActiveIndex(activeIndex));

    // 同じタブを複数押下した場合
    if (this.props.state.appState.activeIndex === activeIndex) {
      return;
    }

    switch (activeIndex) {
      // 社内情報タブを選択
      case 0:
        await dispatch(AsyncActionsUserList.getUserListAction(myUserID, 350));
        break;

      // 社員情報タブを選択
      case 1:
        await dispatch(AsyncActionsOfficeInfo.getRestroomUsageAction(350));
        break;

      default:
        break;
    }
  };

  // スリープ処理
  _sleep = (msec: number) => new Promise(resolve => setTimeout(resolve, msec));

  render() {
    const myUserID = this.props.state.appState['myUserID'];
    return (
      <div>
        <Loading
          isAppStateProcessing={this.props.state.appState.isProcessing}
          isUserListProcessing={this.props.state.userListState.isFetching}
          officeInfoProcessing={this.props.state.officeInfoState.isFetching}
        />
        <Progress
          isUpdating={this.props.state.appState.isUpdating}
          downloadProgress={this.props.state.appState.downloadProgress}
        />
        {myUserID !== -1 && (
          <Fade in={true}>
            <div>
              <MaterialThemeProvider theme={tabTheme}>
                <Tabs
                  value={this.props.state.appState.activeIndex}
                  variant='fullWidth'
                  onChange={this.handleActiveIndexUpdate}
                  style={{ minHeight: '35px' }}
                  indicatorColor='primary'
                  textColor='primary'
                  className='app-tabs'>
                  <Tab label='社員情報' style={{ minHeight: '35px' }} className='app-tab' />
                  <Tab label='社内情報' style={{ minHeight: '35px' }} className='app-tab' />
                  <Tab label='設定' style={{ minHeight: '35px' }} className='app-tab' />
                </Tabs>
              </MaterialThemeProvider>
            </div>
          </Fade>
        )}
        <div className='contents'>
          {myUserID !== -1 && this.props.state.appState.activeIndex === 0 && (
            <Fade in={true}>
              <div>
                <UserList />
                <MenuButtonGroupForUserList />
              </div>
            </Fade>
          )}
          {myUserID !== -1 && this.props.state.appState.activeIndex === 1 && (
            <Fade in={true}>
              <div>
                <OfficeInfo />
                <MenuButtonGroupForOfficeInfo />
              </div>
            </Fade>
          )}
          {myUserID !== -1 && this.props.state.appState.activeIndex === 2 && (
            <Fade in={true}>
              <div>
                <Settings />
              </div>
            </Fade>
          )}
        </div>
        <InitialStartupModal />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state
  };
};

export default connect(mapStateToProps)(App);
