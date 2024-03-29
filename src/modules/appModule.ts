import { Color } from '@material-ui/lab/Alert';
import { createSlice } from '@reduxjs/toolkit';
import { AppInfo } from '../define/model';
import { appActions } from '../actions/appActions';
import { NO_USER, AppTabIndex } from '../define';

interface Snackbar {
  enabled: boolean;
  severity: Color;
  message: string;
  timeoutMs: number | null;
  queueMessages: Array<string>;
}

class InitialState {
  // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  token: string = '';
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: boolean = false;
  myUserId: number = NO_USER;
  appInfo: AppInfo = new AppInfo();
  activeIndex: number = AppTabIndex.userInfo;
  snackbar: Snackbar = {
    enabled: false,
    severity: 'info',
    message: '',
    timeoutMs: 5000,
    queueMessages: [],
  };
  isShowLoadingPopup: boolean = false;
  regularExecutionEnabled = {
    sendHealthCheck: true,
    regularCheckUpdatable: true,
  };
}

// createSlice() で actions と reducers を一気に生成
export const appSlice = createSlice({
  name: 'app',
  initialState: new InitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(appActions.startFetching, (state) => {
        return {
          ...state,
          isFetching: true,
        };
      })
      .addCase(appActions.endFetching, (state) => {
        return {
          ...state,
          isFetching: false,
        };
      })
      .addCase(appActions.fetchingSuccess, (state) => {
        return {
          ...state,
          isError: false,
        };
      })
      .addCase(appActions.failRequest, (state) => {
        return {
          ...state,
          isFetching: false,
          isError: true,
        };
      })
      .addCase(appActions.loginSuccess, (state, action) => {
        return {
          ...state,
          token: action.payload.token,
          isAuthenticated: true,
          isError: false,
        };
      })
      .addCase(appActions.unauthorized, (state) => {
        return {
          ...state,
        };
      })
      .addCase(appActions.getAppInfoSuccess, (state, action) => {
        return {
          ...state,
          appInfo: action.payload.appInfo,
        };
      })
      .addCase(appActions.getCurrentTimeSuccess, (state) => {
        return {
          ...state,
        };
      })
      .addCase(appActions.setMyUserId, (state, action) => {
        return {
          ...state,
          myUserId: action.payload.myUserId,
        };
      })
      .addCase(appActions.setActiveIndex, (state, action) => {
        return {
          ...state,
          activeIndex: action.payload.activeIndex,
        };
      })
      .addCase(appActions.changeEnabledSnackbar, (state, action) => {
        return {
          ...state,
          snackbar: {
            ...state.snackbar,
            enabled: action.payload.enabled,
            severity: action.payload.severity ? action.payload.severity : state.snackbar.severity,
            message: action.payload.message ? action.payload.message : state.snackbar.message,
            timeoutMs: action.payload.timeoutMs === null ? null : action.payload.timeoutMs,
          },
        };
      })
      .addCase(appActions.enqueueSnackbarMessages, (state, action) => {
        const queueMessages = [...state.snackbar.queueMessages];
        queueMessages.push(action.payload.message);
        return {
          ...state,
          snackbar: {
            ...state.snackbar,
            queueMessages,
          },
        };
      })
      .addCase(appActions.dequeueSnackbarMessages, (state) => {
        const queueMessages = [...state.snackbar.queueMessages];
        queueMessages.shift();
        return {
          ...state,
          snackbar: {
            ...state.snackbar,
            queueMessages,
          },
        };
      })
      .addCase(appActions.isShowLoadingPopup, (state, action) => {
        return {
          ...state,
          isShowLoadingPopup: action.payload.isShowLoadingPopup,
        };
      })
      .addCase(appActions.regularSendHealthCheckEnabled, (state, action) => {
        return {
          ...state,
          regularExecutionEnabled: {
            ...state.regularExecutionEnabled,
            sendHealthCheck: action.payload.enabled,
          },
        };
      })
      .addCase(appActions.regularCheckUpdatableEnabled, (state, action) => {
        return {
          ...state,
          regularExecutionEnabled: {
            ...state.regularExecutionEnabled,
            regularCheckUpdatable: action.payload.enabled,
          },
        };
      });
  },
});
