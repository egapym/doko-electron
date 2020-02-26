import { Action, createSlice, Dispatch } from '@reduxjs/toolkit';
import { API_URL, AUTH_REQUEST_HEADERS, LOGIN_REQUEST_HEADERS, LOGIN_USER } from '../define';
import { ApiResponse, Notification, UserInfo } from '../define/model';

class _initialState {
  token: string = ''; // 認証トークン。このトークンを用いてAPIサーバにリクエストを行う
  isAuthenticated: boolean = false;
  isFetching: boolean = false;
  isError: boolean = false;
  myUserID: number = -1;
  notification: Notification = new Notification();
  isProcessing: boolean = false;
  activeIndex: number = 0;
}

// createSlice() で actions と reducers を一気に生成
const slice = createSlice({
  name: 'app',
  initialState: new _initialState(),
  reducers: {
    startApiRequest: state => {
      return {
        ...state,
        isFetching: true
      };
    },
    loginSuccess: (state, action) => {
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        isError: false
      };
    },
    requestError: state => {
      return {
        ...state,
        isFetching: false,
        isError: true
      };
    },
    failRequest: state => {
      return {
        ...state,
        isFetching: false,
        isError: true
      };
    },
    unauthorized: state => {
      /**
       * APIサーバリクエストの認証に失敗（認証トークンの有効期限が切れた等）した場合、
       * 画面をリロードして認証トークンを再取得する
       */
      window.location.reload();
      return {
        ...state
      };
    },
    getNotificationSuccess: (state, action) => {
      return {
        ...state,
        notification: action.payload
      };
    },
    setMyUserId: (state, action) => {
      return {
        ...state,
        myUserID: action.payload
      };
    },
    setProcessingStatus: (state, action) => {
      return {
        ...state,
        isProcessing: action.payload
      };
    },
    setActiveIndex: (state, action) => {
      return {
        ...state,
        activeIndex: action.payload
      };
    }
  }
});

const responseStatusCheck = (dispatch: Dispatch<Action<any>>, statusCode: number) => {
  switch (statusCode) {
    case 401:
      dispatch(slice.actions.unauthorized());
      break;

    default:
      break;
  }
};

export class AsyncActionsApp {
  static loginAction = () => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      dispatch(slice.actions.startApiRequest());
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: LOGIN_REQUEST_HEADERS,
          body: JSON.stringify(LOGIN_USER)
        });

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        const json = await res.json();
        dispatch(slice.actions.loginSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static getNotificationAction = () => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      try {
        const res = await fetch(`${API_URL}/notification`, {
          method: 'GET',
          headers: AUTH_REQUEST_HEADERS
        });

        responseStatusCheck(dispatch, res.status);

        if (res.ok === false) {
          dispatch(slice.actions.requestError());
          return new ApiResponse(null, true);
        }
        const json = await res.json();
        dispatch(slice.actions.getNotificationSuccess(json));
        return new ApiResponse();
      } catch (error) {
        dispatch(slice.actions.failRequest());
        return new ApiResponse(null, true);
      }
    };
  };

  static sendHealthCheckAction = (userInfo: UserInfo, userID: number) => {
    return async (dispatch: Dispatch<Action<any>>): Promise<ApiResponse> => {
      const body = { ...userInfo };
      const res = await fetch(`${API_URL}/userList/${userID}`, {
        method: 'PATCH',
        headers: AUTH_REQUEST_HEADERS,
        body: JSON.stringify(body)
      });

      responseStatusCheck(dispatch, res.status);

      if (res.ok === false) {
        dispatch(slice.actions.requestError());
        return new ApiResponse(null, true);
      }
      console.log('Send healthCheck.');
      return new ApiResponse();
    };
  };
}

export default slice;
