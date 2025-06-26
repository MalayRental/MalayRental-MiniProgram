const { BASE_URL } = require('../api/api');
let socket = null;
let heartbeatTimer = null;
let reconnectTimer = null;
let shouldReconnect = true;

const HEARTBEAT_INTERVAL = 5000;
const RECONNECT_INTERVAL = 3000;

function getUserInfo() {
  try {
    return wx.getStorageSync('userInfo') || {};
  } catch (e) {
    return {};
  }
}

function getToken() {
  try {
    return wx.getStorageSync('userToken') || '';
  } catch (e) {
    return '';
  }
}

function getWsUrl(userId, token) {
  let wsBase = BASE_URL.replace(/^http/, 'ws');
  return `${wsBase}/ws?userId=${userId}&token=${token}`;
}

function connectWebSocket() {
  shouldReconnect = true;
  const userInfo = getUserInfo();
  const token = getToken();
  if (!userInfo.userId || !token) {
    console.log('[WebSocket] 缺少userId或token，无法建立连接');
    return;
  }
  const wsUrl = getWsUrl(userInfo.userId, token);

  if (socket) {
    console.log('[WebSocket] 已有连接，准备重连');
    socket.close({ code: 1000, reason: 'reconnect' });
    socket = null;
  }

  console.log('[WebSocket] 尝试连接:', wsUrl);
  console.log('[WebSocket] connect params:', userInfo, token);
  socket = wx.connectSocket({ url: wsUrl });

  socket.onOpen(() => {
    console.log('[WebSocket] 连接已打开');
    startHeartbeat();
  });

  socket.onClose(() => {
    console.log('[WebSocket] 连接已关闭');
    stopHeartbeat();
    reconnect();
  });

  socket.onError((err) => {
    console.log('[WebSocket] 连接出错', err);
    stopHeartbeat();
    reconnect();
  });

  socket.onMessage((msg) => {
    if (msg.data === 'pong') {
      console.log('[WebSocket] 收到心跳响应：pong');
    } else {
      console.log('[WebSocket] 收到消息：', msg.data);
    }
  });
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === 1) {
      console.log('[WebSocket] 发送心跳：ping');
      socket.send({ data: 'ping' });
    } else {
      console.log('[WebSocket] 连接未就绪，无法发送心跳');
    }
  }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    console.log('[WebSocket] 停止心跳');
  }
}

function reconnect() {
  if (!shouldReconnect) {
    console.log('[WebSocket] 已主动关闭，不再重连');
    return;
  }
  if (reconnectTimer) return;
  console.log('[WebSocket] 计划重连...');
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWebSocket();
  }, RECONNECT_INTERVAL);
}

function closeWebSocket() {
  shouldReconnect = false;
  stopHeartbeat();
  if (socket) {
    console.log('[WebSocket] 主动关闭连接');
    socket.close({ code: 1000, reason: 'manual' });
    socket = null;
  }
}

module.exports = {
  connectWebSocket,
  closeWebSocket
}; 