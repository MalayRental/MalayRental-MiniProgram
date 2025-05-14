// houseDetailService.js
// 房源详情服务

const { post } = require('../request');
const { BASE_URL } = require('../api');

/**
 * 获取房源详情
 * @param {string} houseId 房源ID
 * @returns {Promise} 返回房源详情Promise
 */
const getHouseDetail = (houseId) => {
  const requestData = {
    message: "获取房源信息列表",
    data: { houseId }
  };

  return post('/api/house/getHouseDetail', requestData)
    .then(response => {
      const { data, code, message } = response;
      if (code === 200) {
        // 处理图片
        let detailImages = [];
        if (data.detailImages) {
          detailImages = data.detailImages.split(',').map(img => formatImageUrl(img));
        }
        // 收藏状态兼容处理
        const favoriteStatus = typeof data.favoriteStatus === 'boolean' ? data.favoriteStatus : false;
        // 处理头像url
        const ownerAvatar = formatAvatarUrl(data.ownerAvatar);
        return {
          ...data,
          detailImages,
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

function formatImageUrl(image) {
  if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image;
  }
  return `${BASE_URL}/api/images/houseDetail/${image}`;
}

function formatAvatarUrl(avatar) {
  if (!avatar) return '';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return `${BASE_URL}/api/images/avatar/${avatar}`;
}

module.exports = {
  getHouseDetail
}; 