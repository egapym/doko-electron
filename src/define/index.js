
export const API_URL = 'http://localhost:3001/';
export const TABLE_COLUMNS = [
  { title: "順序", field: "order", visible: false },
  { title: "氏名", field: "name", width: 150, headerSort: false },
  { title: "状態", field: "status", width: 100, headerSort: false },
  { title: "行き先", field: "destination", width: 270, headerSort: false },
  { title: "戻り", field: "return", width: 130, headerSort: false },
  { title: "更新日時", field: "update_at", width: 100, headerSort: false },
  { title: "メッセージ", field: "message", headerSort: false }
];
export const USER_INFO = {
  id: '',
  order: '',
  name: '',
  status: '',
  destination: '',
  return: '',
  update_at: '',
  message: ''
};
export const STATUS_LIST = [
  '在席',
  '退社',
  '年休',
  'AM半休',
  'PM半休',
  'FLEX',
  '出張',
  '外出',
  '本社外勤務',
  '行方不明',
  '遅刻',
  '接客中',
  '離席中'
];