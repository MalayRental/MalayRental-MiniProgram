// historyService.js
// 历史浏览相关服务

const { post } = require('../request');
const { API } = require('../api');
const { getImageUrl } = require('./imageGetService');

/**
 * 获取历史浏览列表
 * @param {string} userId 用户ID
 * @returns {Promise}
 */
const getHistoryList = (userId) => {
  const requestData = {
    message: '获取历史浏览记录',
    data: { runUser: userId }
  };
  return post(API.HISTORY.GET_HISTORY_LIST, requestData)
    .then(res => {
      if (res.code === 200 && Array.isArray(res.data)) {
        // 适配后端数据结构
        return res.data.map(item => {
          const house = item.houseInfo || {};
          return {
            id: house.houseId,
            title: house.houseName,
            address: house.area,
            orientation: house.orientation,
            area: house.proportion,
            areaUnit: '㎡',
            price: house.price,
            priceUnit: 'RM/月',
            imageUrl: getImageUrl('houseCover', house.coverImage),
            createTime: house.createTime,
            updateTime: house.updateTime,
            historyId: item.historyId
          };
        });
      } else {
        return Promise.reject(res.message || '获取历史浏览失败');
      }
    });
};

module.exports = {
  getHistoryList
}; 