const { ipcRenderer } = window.require('electron');
const $ = window.require('jquery');

window.onload = function () {
  ipcRenderer.send('loadRendererProcess', false);
};

const reload = () => {
  // メインプロセスへipc通信を行い、メインプロセスでリロード実行
  $('.reload-btn').prop('disabled', true);
  $('.reload-btn').val('読み込み中...');
  ipcRenderer.send('reload');
};
