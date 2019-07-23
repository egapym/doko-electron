import React, { Component } from 'react';
import { Row, Container, Col, Button, ButtonToolbar} from 'react-bootstrap';
import { getUserList } from '../actions/userList';
import store from '../store/configureStore';
import './MenuButtonGroup.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPowerOff, faSync, faWindowMinimize } from '@fortawesome/free-solid-svg-icons'
import { showModalAction } from '../actions/userEdit';
import UserEditModal from '../containers/UserEditModal';

library.add(faPowerOff, faSync, faWindowMinimize) //あらかじめ使用するアイコンを追加しておく

const { remote } = window.require('electron');

class MenuButtonGroup extends Component {
  close = () => {
    const window = remote.getCurrentWindow();
    window.close();
  }

  reload = () => {
    const { dispatch } = this.props;
    dispatch(getUserList());
  }

  minimize = () => {
    const window = remote.getCurrentWindow();
    window.minimize();
  }

  _getUserInfo = (id) => {
    const userInfo = store.getState().userList['userList']
      .filter(function (userInfo) {
        return userInfo['id'] === 1;
      })[0];
    return userInfo;
  }

  showModal = () => {
    const { dispatch } = this.props;
    dispatch(showModalAction());
  }

  render() {

    return (
      <Row>
        <Container>
          <ButtonToolbar className='menu-button-group'>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.close}>
              <FontAwesomeIcon icon='power-off' /> 終了</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.reload}>
              <FontAwesomeIcon icon='sync' /> 再読込</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.showModal}>
              <FontAwesomeIcon icon='edit' /> 自分編集</Button></Col>
            <Col md={3}><Button variant='light' className='w-100' onClick={this.minimize}>
              <FontAwesomeIcon icon='window-minimize' /> 最小化</Button></Col>
          </ButtonToolbar>
        </Container>
        <UserEditModal userInfo={this._getUserInfo()} />
      </Row>
    );
  }
}

export default MenuButtonGroup;
