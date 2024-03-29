import { takeEvery, call, put, select } from 'redux-saga/effects';
import { callUserListAPI } from '../api/callUserListAPISaga';
import { ApiResponse, UserInfoForUpdate, UserInfo, AddUser } from '../../define/model';
import { getUserInfo } from '../../components/common/utils';
import { MAIN_APP_VERSION, USER_STATUS_INFO, RENDERER_APP_VERSION, NO_USER } from '../../define';
import { RootState } from '../../modules';
import { appActions } from '../../actions/appActions';
import { initialStartupModalActions } from '../../actions/initialStartupModalActions';
import { updateAppVersionForUserInfo, updateStatusForUserInfo, sleepLowestWaitTime } from '../common/utilsSaga';

const Store = window.require('electron-store');
const electronStore = new Store();

const initialStartupModal = {
  // ユーザ登録
  addUser: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();

      const updatedUserInfo: UserInfo = { ...state.initialStartupModalState.userInfo };
      updatedUserInfo.mainAppVersion = MAIN_APP_VERSION;
      updatedUserInfo.rendererAppVersion = RENDERER_APP_VERSION;
      updatedUserInfo.status = USER_STATUS_INFO.s01.status;
      const addUserResponse: ApiResponse<AddUser> = yield call(callUserListAPI.addUser, updatedUserInfo);
      if (addUserResponse.getIsError()) {
        yield put(initialStartupModalActions.disableSubmitButton(false));
        return;
      }
      const myUserId = addUserResponse.getPayload().id;

      // userIdを設定ファイルに登録（既に存在する場合は上書き）
      electronStore.set('userId', myUserId);

      // orderパラメータをidと同じ値に更新する
      const addedUserInfo: UserInfoForUpdate = {};
      addedUserInfo.order = myUserId;

      yield call(callUserListAPI.updateUserInfo, addedUserInfo, myUserId);
      yield call(callUserListAPI.getUserList, myUserId);
      yield closeModal();
      yield put(appActions.setMyUserId(myUserId));
      yield call(callUserListAPI.sendHealthCheck);
      yield put(initialStartupModalActions.initializeField());
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  // ユーザ登録（既存ユーザから選択）
  changeUser: function* () {
    try {
      yield put(appActions.isShowLoadingPopup(true));
      const state: RootState = yield select();
      const myUserId = state.initialStartupModalState.selectedUserId;
      const userList = state.userListState.userList;
      const userInfo = getUserInfo(userList, myUserId);

      if (userInfo === null) {
        return;
      }

      yield call(updateAppVersionForUserInfo, userInfo, myUserId);
      yield call(updateStatusForUserInfo, userInfo, myUserId);

      electronStore.set('userId', myUserId);
      yield call(callUserListAPI.getUserList, myUserId);
      yield closeModal();
      yield put(appActions.setMyUserId(myUserId));
      yield call(callUserListAPI.sendHealthCheck);
      yield put(initialStartupModalActions.initializeField());
    } catch (error) {
      console.error(error);
    } finally {
      yield put(appActions.isShowLoadingPopup(false));
    }
  },

  // 「登録済みの場合はこちら」を選択した際の処理
  selectFromExistingUsers: function* () {
    const processStartTime = Date.now();
    try {
      yield put(appActions.isShowLoadingPopup(true));
      yield put(initialStartupModalActions.initializeField());
      yield put(initialStartupModalActions.disableSubmitButton(true));
      yield put(initialStartupModalActions.changeSubmitMode(true));
      yield call(callUserListAPI.getUserList, NO_USER);
    } catch (error) {
      console.error(error);
    } finally {
      yield call(sleepLowestWaitTime, processStartTime);
      yield put(appActions.isShowLoadingPopup(false));
    }
  },
};

const closeModal = function* () {
  yield put(initialStartupModalActions.showModal(false));
};

export const initialStartupModalSaga = Object.entries(initialStartupModal).map((value: [string, any]) => {
  return takeEvery(`initialStartupModal/logic/${value[0]}`, value[1]);
});
