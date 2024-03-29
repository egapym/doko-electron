import { takeEvery, call, select, put } from 'redux-saga/effects';
import { callUserListAPI } from '../../sagas/api/callUserListAPISaga';
import { getUserInfo } from '../../components/common/utils';
import { USER_STATUS_INFO } from '../../define';
import { UserInfoForUpdate } from '../../define/model';
import { RootState } from '../../modules';
import { appActions } from '../../actions/appActions';

// TypeError: fs.existsSync is not a function が発生する問題の対処
const { remote } = window.require('electron');

const electron = {
  electronLockScreenEvent: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserId = state.appState.myUserId;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserId);
      if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.name = userInfo.name;
      updatedUserInfo.status = USER_STATUS_INFO.s13.status;
      yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserId);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  electronUnlockScreenEvent: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserId = state.appState.myUserId;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserId);
      if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.name = userInfo.name;
      updatedUserInfo.status = USER_STATUS_INFO.s01.status;
      yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserId);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  closeApp: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserId = state.appState.myUserId;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserId);
      if (userInfo === null || [USER_STATUS_INFO.s01.status, USER_STATUS_INFO.s13.status].includes(userInfo.status) === false) {
        closeApp();
        return;
      }

      const updatedUserInfo: UserInfoForUpdate = {};
      updatedUserInfo.status = USER_STATUS_INFO.s02.status;
      updatedUserInfo.name = userInfo.name;
      yield call(callUserListAPI.updateUserInfo, updatedUserInfo, myUserId);
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
      closeApp();
    }
  },
};

const closeApp = () => {
  if (remote.getCurrentWindow().isDestroyed() === false) {
    remote.getCurrentWindow().destroy();
  }
};

export const electronSaga = Object.entries(electron).map((value: [string, any]) => {
  return takeEvery(`electron/logic/${value[0]}`, value[1]);
});
