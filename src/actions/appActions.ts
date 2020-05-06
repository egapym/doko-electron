import { createAction } from '@reduxjs/toolkit';
import { AppInfo } from '../define/model';
import { Color } from '@material-ui/lab/Alert';

export const appActions = {
  startFetching: createAction(`app/startFetching`),
  endFetching: createAction(`app/endFetching`),
  fetchingSuccess: createAction(`app/fetchingSuccess`),
  failRequest: createAction(`app/failRequest`),
  loginSuccess: createAction(`app/loginSuccess`, (token: string) => {
    return {
      payload: {
        token,
      },
    };
  }),
  unauthorized: createAction(`app/unauthorized`),
  getAppInfoSuccess: createAction(`app/getAppInfoSuccess`, (appInfo: AppInfo) => {
    return {
      payload: {
        appInfo,
      },
    };
  }),
  setMyUserId: createAction(`app/setMyUserId`, (myUserID: number) => {
    return {
      payload: {
        myUserID,
      },
    };
  }),
  setFetchingStatus: createAction(`app/setFetchingStatus`, (isFetching: boolean) => {
    return {
      payload: {
        isFetching,
      },
    };
  }),
  setActiveIndex: createAction(`app/setActiveIndex`, (activeIndex: number) => {
    return {
      payload: {
        activeIndex,
      },
    };
  }),
  changeEnabledSnackbar: createAction(
    `changeEnabledSnackbar`,
    (enabled: boolean, severity: Color | null, message: string | null, timeoutMs: number | null) => {
      return {
        payload: {
          enabled,
          severity,
          message,
          timeoutMs,
        },
      };
    }
  ),
  enqueueSnackbarMessages: createAction(`app/enqueueSnackbarMessages`, (message: string) => {
    return {
      payload: {
        message,
      },
    };
  }),
  dequeueSnackbarMessages: createAction(`app/dequeueSnackbarMessages`),
  isShowLoadingPopup: createAction(`app/isShowLoadingPopup`, (isShowLoadingPopup: boolean) => {
    return {
      payload: {
        isShowLoadingPopup,
      },
    };
  }),
};

export const appActionsAsyncLogic = {
  login: createAction(`app/logic/login`),
  sendHealthCheck: createAction(`app/logic/sendHealthCheck`),
  clickTabbar: createAction(`app/logic/clickTabbar`, (activeIndex: number) => {
    return {
      payload: {
        activeIndex,
      },
    };
  }),
};