const { API } = require('../api');
const request = require('../request');

const getChatList = (runUser) => {
  const data = {
    message: '获取会话列表',
    timestamp: Date.now(),
    data: {
      runUser
    }
  };
  return request.post(API.CHAT.GET_CHAT_LIST, data);
};

const getAllMessages = (runUser, chatId) => {
  const data = {
    message: '获取消息内容列表',
    timestamp: Date.now(),
    data: { runUser, chatId }
  };
  return request.post('/api/chat/getAllMessages', data);
};

const readChatMessages = (runUser, chatId) => {
  const data = {
    message: '已读所有消息',
    timestamp: Date.now(),
    data: { runUser, chatId }
  };
  return request.post('/api/chat/readChatMessages', data);
};

const createChat = (runUser, staffId) => {
  const data = {
    message: '创建聊天会话',
    timestamp: Date.now(),
    data: { runUser, staffId }
  };
  return request.post(API.CHAT.CREATE_CHAT, data)
    .then(res => {
      if (res.code === 200 && res.data) {
        return res.data;
      } else {
        return Promise.reject(res.message || '创建会话失败');
      }
    });
};

module.exports = {
  getChatList,
  getAllMessages,
  readChatMessages,
  createChat
}; 