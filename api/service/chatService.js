const { API } = require('../api');
const request = require('../request');

/**
 * 获取会话列表
 * @param {string} runUser 用户ID
 * @returns {Promise}
 */
const getChatList = (runUser) => {
  const data = {
    message: '获取消息列表',
    timestamp: Date.now(),
    data: {
      runUser
    }
  };
  return request.post(API.CHAT.GET_CHAT_LIST, data);
};

module.exports = {
  getChatList
}; 