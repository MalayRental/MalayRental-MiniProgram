const request = require('../request');

const getSearchKey = () => {
  const data = {
    message: "获取搜索关键词",
    timestamp: Date.now(),
    data: null
  };
  return request.post('/api/miniInfo/getSearchKey', data);
};

module.exports = {
  getSearchKey
}; 