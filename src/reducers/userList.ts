import * as UserListActions from '../actions/userList';
import { LEAVING_THRESHOLD_MIN } from '../define';
import { UserInfo, RequestError, Notification } from '../define/model';

export class _UserListState {
  token: string = '';
  isAuthenticated: boolean = false;
  userList: UserInfo[] = [];
  changeUserList: UserInfo[] = [];
  updatedAt: string = '';
  isFetching: boolean = false;
  isError: RequestError = new RequestError();
  myUserID: number = -1;
  selectedUserId: number = -1;
  notification: Notification = new Notification()
}

function userListIsFetching(state = false, action: any) {
  switch (action.type) {
    case UserListActions.LOGIN:
      return true;
    case UserListActions.GET_USER_LIST:
      return true;
    case UserListActions.GET_CHANGE_USER_LIST:
      return true;
    case UserListActions.UPDATE_USER_INFO:
      return true;
    case UserListActions.ADD_USER:
      return true;
    case UserListActions.DELETE_USER:
      return true;
    case UserListActions.CHECK_NOTIFICATION:
      return true;
    default:
      return false;
  }
}

function userListIsError(
  state = new RequestError(),
  action: any
) {
  switch (action.type) {
    case UserListActions.FAIL_REQUEST:
      return {
        ...state,
        status: true,
        code: action.payload.error.status,
        text: action.payload.error.statusText
      };
    default:
      return {
        ...state,
        status: false,
        code: null,
        text: ''
      };
  }
}

/**
 * 登録者情報一覧のstateを管理するReducer
 */
export default function userListState(
  state = new _UserListState(),
  action: any
) {
  switch (action.type) {
    case UserListActions.LOGIN:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.response.token,
        isAuthenticated: true,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.GET_USER_LIST:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.GET_USER_LIST_SUCCESS:
      return {
        ...state,
        userList: updateLeavingTimeForUserList(action.payload.response),
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.GET_CHANGE_USER_LIST:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.GET_CHANGE_USER_LIST_SUCCESS:
      return {
        ...state,
        changeUserList: action.payload.response,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.FAIL_REQUEST:
      return {
        ...state,
        isError: userListIsError(state.isError, action),
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.UPDATE_USER_INFO:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.UPDATE_USER_INFO_SUCCESS:
      return {
        ...state,
        updatedAt: action.payload.response.updated_at,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.CHANGE_ORDER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.CHANGE_ORDER_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.SET_UPDATED_AT:
      return {
        ...state,
        userList: action.userList
      };
    case UserListActions.ADD_USER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.ADD_USER_SUCCESS:
      return {
        ...state,
        myUserID: action.userID,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.DELETE_USER:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action)
      };
    case UserListActions.DELETE_USER_SUCCESS:
      return {
        ...state,
        isFetching: userListIsFetching(state.isFetching, action),
        isError: userListIsError(state.isError, action)
      };
    case UserListActions.SELECT_USER:
      return {
        ...state,
        selectedUserId: action.selectedUserId
      };
    case UserListActions.RETURN_EMPTY_USER_LIST:
      return {
        ...state,
        userList: action.userList
      };
    case UserListActions.RETURN_EMPTY_CHANGE_USER_LIST:
      return {
        ...state,
        changeUserList: action.changeUserList
      };
    case UserListActions.UNAUTHORIZED:
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state
      };
    case UserListActions.CHECK_NOTIFICATION_SUCCESS:
      return {
        ...state,
        notification: action.notification
      };
    case UserListActions.SEND_HEARTBEAT:
      return {
        ...state
      };
    case UserListActions.SET_MY_USER_ID:
      return {
        ...state,
        myUserID: action.userID
      };
    default:
      return state;
  }
}

// 全ユーザの退社チェック
function updateLeavingTimeForUserList(userList: UserInfo[]) {
  if (!userList) return [];

  const nowDate: Date = new Date();
  userList.forEach(userInfo => {
    if (['在席', '在席 (離席中)'].includes(userInfo['status']) === true) {
      const heartbeat: Date = new Date(userInfo['heartbeat']);
      const diffMin = Math.floor((nowDate.getTime() - heartbeat.getTime()) / (1000 * 60));
      if (diffMin >= LEAVING_THRESHOLD_MIN) {
        userInfo['status'] = '退社';
        // 更新日時を最後のheartbeat送信日時に設定する
        userInfo['updated_at'] = userInfo['heartbeat'];
      }
    }
  });

  return userList;
}