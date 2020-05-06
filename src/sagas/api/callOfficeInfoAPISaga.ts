import { ApiResponse } from '../../define/model';
import { callAPI, showSnackBar } from '../../components/common/functions';
import { put, delay } from 'redux-saga/effects';
import { API_REQUEST_LOWEST_WAIT_TIME_MS } from '../../define';
import { officeInfoAPI } from '../../api/officeInfoAPI';
import { menuButtonGroupForOfficeInfoActions } from '../../actions/officeInfo/menuButtonGroupForOfficeInfoActions';

export const callOfficeInfoAPI = {
  getRestroomUsage: function* () {
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(officeInfoAPI.getRestroomUsage);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(menuButtonGroupForOfficeInfoActions.getRestroomUsageSuccess(response.getPayload()));
    }
    return response;
  },

  getOfficeInfo: function* () {
    const startTime = Date.now();
    const response: ApiResponse = yield callAPI(officeInfoAPI.getOfficeInfo);

    const lowestWaitTime = API_REQUEST_LOWEST_WAIT_TIME_MS - (Date.now() - startTime);
    if (Math.sign(lowestWaitTime) === 1) {
      yield delay(lowestWaitTime);
    }

    if (response.getIsError()) {
      showSnackBar('error', '通信に失敗しました。', null);
    } else {
      yield put(menuButtonGroupForOfficeInfoActions.getOfficeInfoSuccess(response.getPayload()));
    }
    return response;
  },
};