const { post } = require('../request');
const { getImageUrl } = require('./imageGetService');

const getHouseList = () => {
  const requestData = {
    message: "获取房源列表",
    data: null
  };

  return post('/api/house/getHouseList', requestData)
    .then(response => {
      const { data, code, message } = response;
      if (code === 200) {
        // 过滤掉 status 不是 Normal 的房源
        const normalHouses = data.filter(house => house.status === 'Normal');
        // 格式化图片路径
        return normalHouses.map(house => ({
          houseId: house.houseId,
          area: house.area,
          houseName: house.houseName,
          orientation: house.orientation,
          proportion: house.proportion,
          price: house.price,
          coverImage: getImageUrl('houseCover', house.coverImage),
          status: house.status,
          lat_lng: house.lat_lng
        }));
      } else {
        return Promise.reject(message || '获取房源列表失败');
      }
    })
    .catch(error => {
      console.error('获取房源列表失败:', error);
      return Promise.reject(error);
    });
};

module.exports = {
  getHouseList
}; 