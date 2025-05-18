const { post } = require('../request');
const { BASE_URL } = require('../api');
const { getUserInfo, isLoggedIn } = require('../../utils/userUtils');

const getHouseDetail = (houseId) => {
  let data = { houseId };
  try {
    let userInfo = require('../../utils/userUtils').getUserInfo();
    if (typeof userInfo === 'string') {
      userInfo = JSON.parse(userInfo);
    }
    if (userInfo && userInfo.userId) {
      data.runUser = userInfo.userId;
    }
  } catch (e) {}
  const requestData = {
    message: "获取房源信息列表",
    data
  };

  return post('/api/house/getHouseDetail', requestData)
    .then(response => {
      const { data, code, message } = response;
      if (code === 200) {
        // 直接返回原始图片字段
        let detailImages = [];
        if (data.detailImages) {
          detailImages = data.detailImages.split(',');
        }
        const coverImage = data.coverImage || '';
        const favoriteStatus = typeof data.favoriteStatus === 'boolean' ? data.favoriteStatus : false;
        const ownerAvatar = data.ownerAvatar || '';
        return {
          ...data,
          detailImages,
          coverImage,
          favoriteStatus,
          ownerAvatar
        };
      } else {
        return Promise.reject(message || '获取房源详情失败');
      }
    })
    .catch(error => {
      console.error('获取房源详情失败:', error);
      return Promise.reject(error);
    });
};

module.exports = {
  getHouseDetail
}; 