import { connect } from 'react-redux';
import UserEditModal from '../../components/userInfo/UserEditModal';

function mapStateToProps(state: any) {
  const { userInfo, onHide, isChangeUser, submitButtonStatus, userID } = state.userEditModal;
  return {
    userInfo,
    onHide,
    isChangeUser,
    submitButtonStatus,
    userID
  };
}

export default connect(mapStateToProps)(UserEditModal);