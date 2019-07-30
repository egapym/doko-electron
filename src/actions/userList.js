import { API_URL, REQUEST_HEADERS } from '../define';

/**
 * Action type
 */
export const GET_USER_LIST = 'GET_USER_LIST';
export const GET_USER_LIST_SUCCESS = 'GET_USER_LIST_SUCCESS';
export const PUT_USER_LIST = 'PUT_USER_LIST';
export const PUT_USER_LIST_SUCCESS = 'PUT_USER_LIST_SUCCESS';
export const ADD_USER = 'ADD_USER';
export const ADD_USER_SUCCESS = 'ADD_USER_SUCCESS';
export const DELETE_USER = 'DELETE_USER';
export const DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS';
export const FAIL_REQUEST = 'FAIL_REQUEST';
export const SELECT_USER = 'SELECT_USER';
export const RETURN_EMPTY_USER_LIST = 'RETURN_EMPTY_USER_LIST';

/**
 * Action Creator
 */
export const getUserListActionCreator = () => ({
  type: GET_USER_LIST
});
export const getUserListSccessActionCreator = (json) => ({
  type: GET_USER_LIST_SUCCESS,
  payload: {
    response: json
  }
});
export const updateUserInfoActionCreator = () => ({
  type: PUT_USER_LIST
});
export const updateUserInfoSuccessActionCreator = () => ({
  type: PUT_USER_LIST_SUCCESS
});
export const addUserActionCreator = () => ({
  type: ADD_USER
});
export const addUserSuccessActionCreator = (userInfo) => ({
  type: ADD_USER_SUCCESS,
  payload: {
    response: userInfo
  }
});
export const deleteUserActionCreator = () => ({
  type: DELETE_USER
});
export const deleteUserSuccessActionCreator = () => ({
  type: DELETE_USER_SUCCESS,
});
export const failRequestActionCreator = (error) => ({
  type: FAIL_REQUEST,
  error: true,
  payload: {
    error
  }
});
export const selectUserActionCreator = (selectedUserId) => ({
  type: SELECT_USER,
  selectedUserId: selectedUserId
});
export const returnEmptyUserListActionCreator = () => ({
  type: RETURN_EMPTY_USER_LIST,
  userList: []
})

export const deleteUserAction = (userID) => {
  return (dispatch) => {
    dispatch(deleteUserActionCreator());
    return fetch(API_URL + 'userList/' + userID,
      {
        method: 'DELETE',
        headers: REQUEST_HEADERS
      })
      .then(async res => {
        if (!res.ok) {
          return Promise.reject(new Error(res.statusText));
        }
        return;
      })
      .then(() => dispatch(deleteUserSuccessActionCreator()))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const addUserAction = (userInfo) => {
  return (dispatch) => {
    dispatch(addUserActionCreator());
    return fetch(API_URL + 'userList',
      {
        method: 'POST',
        headers: REQUEST_HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(async res => {
        if (!res.ok) {
          return Promise.reject(new Error(res.statusText));
        }
        const json = await res.json();
        return json;
      })
      .then(userInfo => dispatch(addUserSuccessActionCreator(userInfo)))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const updateUserInfoAction = (userInfo, userID) => {
  return (dispatch) => {
    dispatch(updateUserInfoActionCreator());
    return fetch(API_URL + 'userList/' + userID,
      {
        method: 'PUT',
        headers: REQUEST_HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(res => {
        if (!res.ok || res.status === 404) {
          return Promise.reject(new Error(res.statusText));
        }
        return;
      })
      .then(() => dispatch(updateUserInfoSuccessActionCreator()))
      .catch(error => dispatch(failRequestActionCreator(error)));
  }
};

export const getUserListAction = () => {
  return (dispatch) => {
    dispatch(getUserListActionCreator());
    return fetch(API_URL + 'userList',
      {
        method: 'GET',
        headers: REQUEST_HEADERS
      })
      .then( async res => {
        if (!res.ok) {
          return Promise.reject(new Error(res.statusText));
        }
        const json = await res.json();
        return json;
      })
      .then(json => dispatch(getUserListSccessActionCreator(json)))
      .catch(error => {
        dispatch(failRequestActionCreator(error))
        dispatch(returnEmptyUserListAction());
      });
  }
};

export const selectUserAction = (selectedUserId) => {
  return (dispatch) => {
    dispatch(selectUserActionCreator(selectedUserId));
    return selectedUserId;
  }
};

export const returnEmptyUserListAction = () => {
  return (dispatch) => {
    dispatch(returnEmptyUserListActionCreator());
  }
}
