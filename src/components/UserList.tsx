import React from 'react';
import './UserList.css';
import 'react-tabulator/lib/styles.css';
// import 'react-tabulator/lib/css/tabulator_modern.min.css';
import 'react-tabulator/lib/css/tabulator.min.css';
import { ReactTabulator } from 'react-tabulator';
import { TABLE_COLUMNS } from '../define';
import { showUserEditModalActionCreator } from '../actions/userEditModal';
import store from '../store/configureStore';
import { getUserListAction, changeOrderAction } from '../actions/userList';
import { disableSubmitButtonActionCreator } from '../actions/userEditModal';
import { UserInfo } from '../define/model';

class UserList extends React.Component<any, any> {
  _getUserInfo = (userList: UserInfo[], userID: number): UserInfo | null => {
    if (!userList) {
      return null;
    }
    const userInfo = userList.filter(userInfo => {
      return userInfo['id'] === userID;
    })[0];
    return userInfo || null;
  };

  showUserEditModal = (e: any, row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const userList = store.getState().userListState['userList'];
    const selectedUserId = row.getData()['id'];
    const userInfo = this._getUserInfo(userList, selectedUserId);

    if (userInfo === null) {
      return;
    }

    dispatch(disableSubmitButtonActionCreator());
    dispatch(showUserEditModalActionCreator(selectedUserId, userInfo));
  };

  _rowFormatter = (row: Tabulator.RowComponent) => {
    const rowData = row.getData();
    // 状態によってテキストの色を変える
    switch (rowData.status) {
      case '退社':
        row.getElement().style.color = '#0000FF';
        break;
      case '年休':
        row.getElement().style.color = '#FF0000';
        break;
      case 'AM半休':
        row.getElement().style.color = '#00A900';
        break;
      case 'PM半休':
        row.getElement().style.color = '#FF0000';
        break;
      case 'FLEX':
        row.getElement().style.color = '#00A900';
        break;
      case '出張':
        row.getElement().style.color = '#0000FF';
        break;
      case '外出':
        row.getElement().style.color = '#0000FF';
        break;
      case '本社外勤務':
        row.getElement().style.color = '#0000FF';
        break;
      case '行方不明':
        row.getElement().style.color = '#FF0000';
        break;
      case '遅刻':
        row.getElement().style.color = '#00A900';
        break;
      case '接客中':
        row.getElement().style.color = '#00A900';
        break;
      default:
        break;
    }
    // 自分の名前を太字にする
    if (rowData.id === store.getState().userListState['myUserID']) {
      row.getCell('name').getElement().style.fontWeight = 'bold';
    }
  };

  // 各ユーザの「order」パラメータをユーザ一覧の表示順序を元に更新する
  _updateUserInfoOrder = (row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;
    const rows = row.getTable().getRows();

    return new Promise(resolve => {
      rows.forEach(async (row: Tabulator.RowComponent, index: number) => {
        const patchInfoUser = { order: row.getPosition(true) + 1 };
        await dispatch(changeOrderAction(patchInfoUser, row.getData().id));
        if (index + 1 === rows.length) {
          resolve();
        }
      });
    });
  };

  _rowMovedCallback = async (row: Tabulator.RowComponent) => {
    const { dispatch } = this.props;

    await this._updateUserInfoOrder(row);
    dispatch(getUserListAction());
  };

  render() {
    const { userList } = this.props;
    return (
      // ReactTabulatorで発生するエラーを @ts-ignore を用いて無視
      // ※なぜか placeholder の型定義が存在しないため（公式の不具合？）
      // @ts-ignore
      <ReactTabulator
        className='user-list'
        data={userList}
        columns={TABLE_COLUMNS}
        tooltips={true}
        layout={'fitData'}
        height={window.innerHeight - 87}
        rowDblClick={this.showUserEditModal}
        resizableColumns={true}
        rowFormatter={this._rowFormatter}
        placeholder={'通信に失敗しました。'}
        options={{
          movableRows: true,
          initialSort: [{ column: 'updated_at', dir: 'asc' }, { column: 'order', dir: 'asc' }]
        }}
        rowMoved={this._rowMovedCallback}
      />
    );
  }
}

export default UserList;