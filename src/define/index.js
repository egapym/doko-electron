export const API_URL = process.env.REACT_APP_API_URL;
export const LOGIN_USER = {
  username: process.env.REACT_APP_USERNAME,
  password: process.env.REACT_APP_PASSWORD
};
export const APP_DOWNLOAD_URL = process.env.REACT_APP_DOWNLOAD_URL;
export const LOGIN_REQUEST_HEADERS = {
  'Content-type': 'application/json; charset=UTF-8'
};
export const AUTH_REQUEST_HEADERS = {
  'Content-type': 'application/json; charset=UTF-8'
};
export const TABLE_COLUMNS = [
  { rowHandle: true, formatter: 'handle', headerSort: false, frozen: true, width: 25, minWidth: 25, resizable: false },
  { title: '順序', field: 'order', visible: false, headerSort: false, sorter: 'number' },
  { title: '氏名', field: 'name', width: 150, headerSort: false },
  { title: '状態', field: 'status', width: 100, headerSort: false },
  { title: '行き先', field: 'destination', width: 270, headerSort: false },
  { title: '戻り', field: 'return', width: 130, headerSort: false },
  {
    title: '更新日時',
    field: 'updated_at',
    width: 90,
    headerSort: false,
    sorter: 'datetime',
    sorterParams: { format: 'YYYY-MM-DD hh:mm:ss.SSS' },
    formatter: 'datetime',
    formatterParams: {
      outputFormat: 'YYYY/MM/DD',
      invalidPlaceholder: ''
    }
  },
  { title: 'メッセージ', field: 'message', headerSort: false }
];
export const USER_INFO = {
  id: null,
  order: null,
  name: '',
  status: '',
  destination: '',
  return: '',
  updated_at: '',
  message: '',
  version: '',
  heartbeat: ''
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
  '在席 (離席中)'
];
export const HEARTBEAT_INTERVAL_MS = 270000; // 4分30秒
export const LEAVING_THRESHOLD_MIN = 10; // 10分
