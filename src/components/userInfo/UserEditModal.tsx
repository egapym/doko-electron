import { Fade, Tooltip, Button, TextField, Modal, Backdrop } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import { Props } from '../../define/model';
import { userEditModalActions } from '../../actions/userInfo/userEditModalActions';
import './UserEditModal.css';
import { Container, Form, Col } from 'react-bootstrap';
import { STATUS_LIST } from '../../define';
import { userListActionsAsyncLogic } from '../../actions/userInfo/userListActions';

class UserEditModal extends React.Component<Props, any> {
  closeModal = () => {
    const { dispatch } = this.props;
    dispatch(userEditModalActions.closeUserEditModal());
  };

  onUserInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { dispatch } = this.props;
    dispatch(userEditModalActions.changeUserInfo(event.target.name, event.target.value));
    if (this.props.state.userEditModalState.disabled) {
      dispatch(userEditModalActions.enableSubmitButton());
    }
  };

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // 画面がリロードされるのを防ぐ
    event.preventDefault();
    const { dispatch } = this.props;
    dispatch(userEditModalActions.disableSubmitButton());
    dispatch(userListActionsAsyncLogic.updateUserInfo());
  };

  deleteUser = () => {
    const { dispatch } = this.props;
    dispatch(userListActionsAsyncLogic.deleteUser());
  };

  inputClear = () => {
    const { dispatch } = this.props;
    dispatch(userEditModalActions.inputClear());
    dispatch(userEditModalActions.enableSubmitButton());
  };

  render() {
    const userInfo = this.props.state.userEditModalState.userInfo;

    return (
      <Modal
        aria-labelledby='contained-modal-title-vcenter'
        aria-describedby='spring-modal-description'
        className={'modal'}
        open={this.props.state.userEditModalState.onHide}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
        }}>
        <Fade in={this.props.state.userEditModalState.onHide}>
          <div className={'modal-paper'}>
            <Form onSubmit={this.handleSubmit}>
              <span className='modal-title'>情報変更</span>
              <hr />
              <Container>
                <Form.Row>
                  <Form.Group as={Col} controlId='name'>
                    <Form.Label>
                      <span className='name'>氏名</span>
                    </Form.Label>
                    <TextField
                      name='name'
                      value={userInfo.name}
                      onChange={this.onUserInfoChange}
                      size={'small'}
                      fullWidth
                      inputProps={{
                        maxLength: 100,
                      }}
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='status'>
                    <Form.Label>
                      <span className='status'>状態</span>
                    </Form.Label>
                    <Tooltip
                      title={<span className='user-edit-modal-tooltip'>状態を在席に変更し、行き先と戻りを削除します</span>}
                      placement='top'
                      arrow>
                      <Button
                        variant='outlined'
                        color='default'
                        size={'small'}
                        onClick={this.inputClear}
                        style={{ maxHeight: '28px', boxShadow: 'none' }}
                        className='base-btn-outline user-edit-modal-presence-button'
                        tabIndex={-1}>
                        在席
                      </Button>
                    </Tooltip>
                    <TextField
                      select
                      name='status'
                      value={userInfo.status}
                      onChange={this.onUserInfoChange}
                      fullWidth
                      size={'small'}
                      SelectProps={{
                        native: true,
                      }}>
                      {STATUS_LIST.map((status: string, index: number) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                      <option hidden>{userInfo.status}</option>
                    </TextField>
                  </Form.Group>
                </Form.Row>
                <Form.Row>
                  <Form.Group as={Col} controlId='destination'>
                    <Form.Label>行き先</Form.Label>
                    <TextField
                      name='destination'
                      value={userInfo.destination}
                      onChange={this.onUserInfoChange}
                      size={'small'}
                      fullWidth
                      inputProps={{
                        maxLength: 100,
                      }}
                    />
                  </Form.Group>
                  <Form.Group as={Col} controlId='return'>
                    <Form.Label>戻り</Form.Label>
                    <TextField
                      name='return'
                      value={userInfo.return}
                      onChange={this.onUserInfoChange}
                      size={'small'}
                      fullWidth
                      inputProps={{
                        maxLength: 100,
                      }}
                    />
                  </Form.Group>
                </Form.Row>
                <Form.Group controlId='message'>
                  <Form.Label>メッセージ</Form.Label>
                  <TextField
                    name='message'
                    value={userInfo.message}
                    onChange={this.onUserInfoChange}
                    size={'small'}
                    fullWidth
                    inputProps={{
                      maxLength: 100,
                    }}
                  />
                </Form.Group>
              </Container>
              <hr />
              <Button
                variant='outlined'
                color='primary'
                onClick={this.deleteUser}
                style={{ float: 'left', boxShadow: 'none' }}
                className='base-btn-outline user-edit-modal-delete-button'
                tabIndex={-1}>
                削除
              </Button>
              <div className='submit-button-group'>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={this.closeModal}
                  className='base-btn-outline user-edit-modal-base-button'
                  style={{ boxShadow: 'none' }}>
                  キャンセル
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  disabled={this.props.state.userEditModalState.disabled}
                  style={{ boxShadow: 'none' }}
                  className='user-edit-modal-base-button'>
                  登録
                </Button>
              </div>
            </Form>
          </div>
        </Fade>
      </Modal>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    state,
  };
};

export default connect(mapStateToProps)(UserEditModal);
