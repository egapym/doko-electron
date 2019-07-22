import { connect } from 'react-redux';
import UserList from '../components/UserList';

function mapStateToProps(state) {
  const { userList, isFetching, isError } = state.userList;
  return {
    userList,
    isFetching,
    isError
  };
}

export default connect(mapStateToProps)(UserList);
