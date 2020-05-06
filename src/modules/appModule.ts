import { Color } from '@material-ui/lab/Alert';
import { createSlice } from '@reduxjs/toolkit';
import { Notification } from '../define/model';
import { appActions } from '../actions/appActions';

interface Snackbar {
  enabled: boolean;
  severity: Color;
  message: string;
  timeoutMs: number | null;
  queueMessages: Array<string>;
}

class _initialState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: boolean = false;
  myUserID: number = -1;
  notification: Notification = new Notification();
  activeIndex: number = 0;
  snackbar: Snackbar = {
    enabled: false,
    severity: 'info',
    message: '',
    timeoutMs: 5000,
    queueMessages: new Array<string>(),
  };
  isShowLoadingPopup: boolean = false;
}

// createSlice() で actions と reducers を一気に生成
export const appSlice = createSlice({
  name: 'app',
  initialState: new _initialState(),
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
        /**
         * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
         * 画面をリロードして認証トークンを再取得する
         */
        window.location.reload();
        return {
          ...state,
        };
      })
      .addCase(appActions.getNotificationSuccess, (state, action) => {
        return {
          ...state,
          notification: action.payload.notification,
        };
      })
      .addCase(appActions.setMyUserId, (state, action) => {
        return {
          ...state,
          myUserID: action.payload.myUserID,
        };
      })
      .addCase(appActions.setFetchingStatus, (state, action) => {
        return {
          ...state,
          isFetching: action.payload.isFetching,
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
            timeoutMs: action.payload.timeoutMs !== null ? action.payload.timeoutMs : null,
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
      });
  },
});
