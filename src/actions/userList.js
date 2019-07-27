import { API_URL } from '../define';

/**
 * Action type
 */
export const GET_USER_LIST = 'GET_USER_LIST';
export const PUT_USER_LIST = 'PUT_USER_LIST';
export const SUCCESS_PUT_USER_LIST = 'SUCCESS_PUT_USER_LIST';
export const ADD_USER = 'ADD_USER';
export const SUCCESS_ADD_USER = 'SUCCESS_ADD_USER';
export const RECEIVE_USER_LIST = 'RECEIVE_USER_LIST';
export const FAIL_REQUEST_USER_LIST = 'FAIL_REQUEST_USER_LIST';
export const SELECT_USER = 'SELECT_USER';

const HEADERS = {
  "Content-type": "application/json; charset=UTF-8"
};

/**
 * Action Creator
 */
export const getUserListActionCreator = () => ({
  type: GET_USER_LIST
});
export const updateUserInfoActionCreator = () => ({
  type: PUT_USER_LIST
});
export const successUpdateUserInfoActionCreator = () => ({
  type: SUCCESS_PUT_USER_LIST
});
export const addUserActionCreator = () => ({
  type: ADD_USER
});
export const successAddUserActionCreator = (userID) => ({
  type: SUCCESS_ADD_USER,
  payload: {
    response: userID
  }
});
export const receiveUserListActionCreator = (json) => ({
  type: RECEIVE_USER_LIST,
  payload: {
    response: json
  }
});
export const failRequestUserListActionCreator = (error) => ({
  type: FAIL_REQUEST_USER_LIST,
  error: true,
  payload: {
    error
  }
});
export const selectUserActionCreator = (selectedUserId) => ({
  type: SELECT_USER,
  selectedUserId: selectedUserId
});

export const addUserAction = (userInfo) => {
  return (dispatch) => {
    dispatch(addUserActionCreator());
    return fetch(API_URL + 'userList',
      {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(async res => {
        if (!res.ok) {
          return Promise.reject(new Error(res.statusText));
        }
        const json = await res.json();
        return json;
      })
      .then(userID => dispatch(successAddUserActionCreator(userID)))
      .catch(error => dispatch(failRequestUserListActionCreator(error)));
  }
};

export const updateUserInfoAction = (userInfo, id) => {
  return (dispatch) => {
    dispatch(updateUserInfoActionCreator());
    return fetch(API_URL + 'userList/' + id,
      {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(userInfo),
      })
      .then(res => {
        if (!res.ok || res.status === 404) {
          return Promise.reject(new Error(res.statusText));
        }
        return;
      })
      .then(() => dispatch(successUpdateUserInfoActionCreator()))
      .catch(error => dispatch(failRequestUserListActionCreator(error)));
  }
};

export const getUserListAction = () => {
  return (dispatch) => {
    dispatch(getUserListActionCreator());
    return fetch(API_URL + 'userList',
      {
        method: 'GET',
        headers: HEADERS
      })
      .then( async res => {
        if (!res.ok) {
          return Promise.reject(new Error(res.statusText));
        }
        const json = await res.json();
        return json;
      })
      .then(json => dispatch(receiveUserListActionCreator(json)))
      .catch(error => dispatch(failRequestUserListActionCreator(error)));
  }
};

export const selectUserAction = (selectedUserId) => {
  return (dispatch) => {
    dispatch(selectUserActionCreator(selectedUserId));
    return selectedUserId;
  }
};
