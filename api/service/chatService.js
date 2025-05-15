const { API } = require('../api');
const request = require('../request');

/**
 * 获取会话列表
 * @param {string} runUser 用户ID
 * @returns {Promise}
 */
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

module.exports = {
  getChatList,
  getAllMessages
}; 