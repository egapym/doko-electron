/**
 * プレゼンテーショナルコンポーネント
 * プレゼンテーショナルコンポーネントは基本的にpropsをもとに見た目を作る普通のReactコンポーネント。
 * できるだけステートレスで作る。（可能な限りステートレス）
 */

import './UserEditModal.css';
import React, { Component } from 'react';
import { Container, Col, Form, Modal, Button } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { closeModalActionCreator } from '../actions/userEdit';
import store from '../store/configureStore';
import { updateUserInfoAction, getUserListAction } from '../actions/userList';
import { USER_INFO, STATUS_LIST } from '../define';

library.add(faEdit) //あらかじめ使用するアイコンを追加しておく

class UserEditModal extends Component {
  constructor(props) {
    super(props)
    this.userInfo = USER_INFO;
  }

  componentDidUpdate() {
    const selectedUserId = store.getState().userList.selectedUserId;
    const userInfo = this._getUserInfo(selectedUserId)

    this.userInfo = Object.assign({}, userInfo);
  }

  _getUserInfo = (id) => {
    const userList = store.getState().userList['userList'];

    if (userList.length > 0) {
      const userInfo = userList
        .filter(function (userInfo) {
          return userInfo['id'] === id;
        })[0];
      return userInfo;
    }
    return {};
  }

  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(closeModalActionCreator());
  }

  _updateUserInfo = (userInfo) => {
    const { dispatch } = this.props;
    const selectedUserId = store.getState().userList.selectedUserId;

    dispatch(updateUserInfoAction(userInfo, selectedUserId))
      .then(
        () => {
          const userList = store.getState().userList;
          if (userList.isError.status) {
            return;
          }
          this.closeModal();
          dispatch(getUserListAction())
        }
      );
  }

  handleChange = (event) => {
    this.userInfo[event.target.name] = event.target.value;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this._updateUserInfo(this.userInfo);
  }

  render() {
    const userInfo = this.userInfo;
    const onHide = store.getState().userEdit.onHide;
    const isError = store.getState().userList.isError.status;

    return (
      <Modal show={onHide} aria-labelledby='contained-modal-title-vcenter' centered backdrop='static' animation={true} size='xl'>
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            情報変更
            {isError &&
              <span className='error-message'>通信に失敗しました。</span>
            }
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Body>
            <Container>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>氏名</Form.Label>
                  <Form.Control name="name" placeholder="" defaultValue={userInfo.name} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>状態</Form.Label>
                  <Form.Control name="status" as='select' defaultValue={STATUS_LIST.includes(userInfo.status) ? userInfo.status : '？？？'} onChange={this.handleChange}>
                    {STATUS_LIST.map((status) => (
                      <option>{status}</option>
                    ))}
                    <option hidden>？？？</option>
                  </Form.Control>
                </Form.Group>
              </Form.Row>
              <Form.Row>
                <Form.Group as={Col}>
                  <Form.Label>行き先</Form.Label>
                  <Form.Control name="destination" placeholder="" defaultValue={userInfo.destination} onChange={this.handleChange} />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>戻り</Form.Label>
                  <Form.Control name="return" placeholder="" defaultValue={userInfo.return} onChange={this.handleChange} />
                </Form.Group>
              </Form.Row>
              <Form.Group>
                <Form.Label>メッセージ</Form.Label>
                <Form.Control name="message" placeholder="" defaultValue={userInfo.message} onChange={this.handleChange} />
              </Form.Group>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant='primary' className='modal-button'>更新</Button>
            <Button variant='light' className='modal-button' onClick={this.closeModal}>キャンセル</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }
}

export default UserEditModal;