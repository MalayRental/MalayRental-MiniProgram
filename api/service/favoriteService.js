const { post } = require('../request');
const { API } = require('../api');
const { getImageUrl } = require('./imageGetService');

const getFavoriteList = (userId) => {
  const requestData = {
    message: '获取消息内容列表',
    data: { runUser: userId }
  };
  return post(API.FAVORITE.GET_FAVORITE_LIST, requestData)
    .then(res => {
      if (res.code === 200 && Array.isArray(res.data)) {
        // 格式化图片URL
        const list = res.data.map(item => {
          const house = item.houseInfo || {};
          return {
            favoriteId: item.favoriteId,
            houseId: house.houseId,
            houseName: house.houseName,
            area: house.area,
            orientation: house.orientation,
            proportion: house.proportion,
            price: house.price,
            createTime: house.createTime,
            updateTime: house.updateTime,
            coverImage: getImageUrl('houseCover', house.coverImage),
            status: house.status
          };
        });
        return list;
      } else {
        return Promise.reject(res.message || '获取收藏列表失败');
      }
    });
};

const addFavoriteItem = (userId, houseId) => {
  const requestData = {
    message: '添加收藏项',
    data: { runUser: userId, houseId }
  };
  return post(API.FAVORITE.ADD_FAVORITE_ITEM, requestData)
    .then(res => {
      if (res.code === 200) {
        return true;
      } else {
        return Promise.reject(res.message || '添加收藏失败');
      }
    });
};

const removeFavoriteItem = (userId, houseId) => {
  const requestData = {
    message: '移除收藏项',
    data: { runUser: userId, houseId }
  };
  return post(API.FAVORITE.REMOVE_FAVORITE_ITEM, requestData)
    .then(res => {
      if (res.code === 200) {
        return true;
      } else {
        return Promise.reject(res.message || '移除收藏失败');
      }
    });
};

const checkFavoriteStatus = (userId, houseId) => {
  const requestData = {
    message: '检查收藏状态',
    data: { runUser: userId, houseId }
  };
  return post(API.FAVORITE.CHECK_FAVORITE_STATUS, requestData)
    .then(res => {
      if (res.code === 200 && res.data && typeof res.data.status !== 'undefined') {
        return res.data.status === 'true' || res.data.status === true;
      } else {
        return false;
      }
    });
};

module.exports = {
  getFavoriteList,
  addFavoriteItem,
  removeFavoriteItem,
  checkFavoriteStatus
}; 