import { ApiResponse, UserInfo } from '../../define/model';
import { callAPI, callAPIWithoutErrorSnackBar } from '../../components/common/functions';
import AppSlice from '../../modules/appModule';
import { put } from 'redux-saga/effects';
import { AppAPI } from '../../api/appAPI';

export class CallAppAPI {
  static login = function* () {
    yield put(AppSlice.actions.startApiRequest());
    const response: ApiResponse = yield callAPI(AppAPI.login);
    if (response.getIsError()) {
      yield put(AppSlice.actions.failRequest());
    } else {
      yield put(AppSlice.actions.loginSuccess(response));
    }
    return response;
  };

  static getNotification = function* () {
    const response = yield callAPI(AppAPI.getNotification);
    if (response.getIsError()) {
      yield put(AppSlice.actions.failRequest());
    } else {
      yield put(AppSlice.actions.getNotificationSuccess(response));
    }
    return response;
  };

  // action: ReturnType<typeof AppActionsForAsync.sendHealthCheck>
  static sendHealthCheck = function* (userInfo: UserInfo, userID: number) {
    const response: ApiResponse = yield callAPIWithoutErrorSnackBar(AppAPI.sendHealthCheck, userInfo, userID);
    if (!response.getIsError()) {
      console.log('Send healthCheck.');
    }
    return response;
  };
}
