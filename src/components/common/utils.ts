import { Color } from '@material-ui/lab/Alert';
import store from '../../configureStore';
import {
  APP_NAME,
  MAIN_APP_VERSION,
  HEALTH_CHECK_INTERVAL_MS,
  VERSION_CHECK_INTERVAL_MS,
  RENDERER_APP_VERSION,
  SNACKBAR_DISPLAY_DEFAULT_TIME_MS,
  NO_USER_IN_USERLIST,
} from '../../define';
import { UserInfo } from '../../define/model';
import { appActions, appActionsAsyncLogic } from '../../actions/appActions';

// TypeError: fs.existsSync is not a function が発生する問題の対処
const { remote } = window.require('electron');
const Store = window.require('electron-store');
const electronStore = new Store();
const NO_QUEUE_MESSAGES = 0;

// ※戻り値の userInfo はイミュータブル
export const getUserInfo = (userList: UserInfo[], userId: number): UserInfo | null => {
  if (!userList) {
    return null;
  }
  const userInfo = userList.filter((_userInfo) => {
    return _userInfo.id === userId;
  });
  return userInfo.length === NO_USER_IN_USERLIST ? null : { ...userInfo[0] };
};

export const getUserListIndexByUserId = (userList: UserInfo[], userId: number): number | null => {
  if (!userList) {
    return null;
  }
  const userInfo = userList.filter((_userInfo) => {
    return _userInfo.id === userId;
  });

  return userInfo.length === NO_USER_IN_USERLIST ? null : userList.indexOf(userInfo[0]);
};

export const showMessageBoxSync = (message: string, type: 'info' | 'warning' = 'info') => {
  // テキストが設定されていない場合は処理をスキップ
  if (!message) {
    return;
  }

  remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    title: APP_NAME,
    type,
    buttons: ['OK'],
    message,
  });
};

export const showMessageBoxSyncWithReturnValue = (
  OKButtonText: string,
  cancelButtonText: string,
  message: string,
  type: 'info' | 'warning' = 'info'
): any => {
  return remote.dialog.showMessageBoxSync(remote.getCurrentWindow(), {
    title: APP_NAME,
    type,
    buttons: [OKButtonText, cancelButtonText],
    message,
  });
};

export const showSnackBar = (
  severity: Color,
  message: string = '',
  timeoutMs: number | null = SNACKBAR_DISPLAY_DEFAULT_TIME_MS
) => {
  const dispatch: any = store.dispatch;
  const appState = store.getState().appState;

  if (appState.snackbar.queueMessages.length > NO_QUEUE_MESSAGES) {
    return;
  }

  if (appState.snackbar.enabled) {
    // 現在表示されているsnackbarを破棄して、新しいsnackbarを表示する
    dispatch(appActions.enqueueSnackbarMessages(message));
    dispatch(appActions.changeEnabledSnackbar(false, null, null, null));
  } else {
    dispatch(appActions.changeEnabledSnackbar(true, severity, message, timeoutMs));
  }
};

export const onSnackBarClose = () => {
  const dispatch: any = store.dispatch;
  /*
   * ※いつか使うかもしれない & 分からなくなりそうなのであえて残しておく
   * 画面クリックでsnackbarを閉じない
   * if (reason === 'clickaway') {
   *   return;
   * }
   */
  dispatch(appActions.changeEnabledSnackbar(false, null, null, null));
};

export const onSnackBarExited = () => {
  const dispatch: any = store.dispatch;
  const appState = store.getState().appState;
  const queueMessages = [...appState.snackbar.queueMessages];

  if (queueMessages.length > NO_QUEUE_MESSAGES) {
    const message = queueMessages.shift() as string;
    dispatch(appActions.dequeueSnackbarMessages());
    dispatch(appActions.changeEnabledSnackbar(true, appState.snackbar.severity, message, null));
  }
};

export const isLatestMainVersion = (latestVersion: string): boolean => {
  return latestVersion === MAIN_APP_VERSION;
};

export const isLatestRendererVersion = (latestVersion: string): boolean => {
  return latestVersion === RENDERER_APP_VERSION;
};

export const regularExecution = () => {
  const dispatch: any = store.dispatch;

  setInterval(() => {
    const regularExecutionEnabled = store.getState().appState.regularExecutionEnabled;
    if (regularExecutionEnabled.sendHealthCheck) {
      dispatch(appActionsAsyncLogic.sendHealthCheck());
    }
  }, HEALTH_CHECK_INTERVAL_MS);

  setInterval(() => {
    const regularExecutionEnabled = store.getState().appState.regularExecutionEnabled;
    if (regularExecutionEnabled.regularCheckUpdatable) {
      dispatch(appActionsAsyncLogic.regularCheckUpdatable());
    }
  }, VERSION_CHECK_INTERVAL_MS);
};

// アプリケーションのバージョンアップにより互換性が無くなったデータを修正する
export const versionMigration = () => {
  const userId = electronStore.get('userID');
  if (typeof userId !== 'undefined') {
    electronStore.set('userId', userId);
    electronStore.delete('userID');
  }
  const mainVersion = electronStore.get('appVersion');
  if (typeof mainVersion !== 'undefined') {
    electronStore.set('version.main', mainVersion);
    electronStore.delete('appVersion');
  }
  const rendererVersion = electronStore.get('messageVersion');
  if (typeof rendererVersion !== 'undefined') {
    electronStore.set('version.renderer', rendererVersion);
    electronStore.delete('messageVersion');
  }
};

export const getAuthorizationHeader = () => {
  const token = store.getState().appState.token;
  return { Authorization: `Bearer ${token}` };
};
