const { post } = require('../request');
const { BASE_URL } = require('../api');

const getHouseList = () => {
  const requestData = {
    message: "获取房源列表",
    data: null
  };

  return post('/api/house/getHouseList', requestData)
    .then(response => {
      const { data, code, message } = response;
      if (code === 200) {
        // 格式化图片路径
        return data.map(house => ({
          id: house.houseId,
          area: house.area,
          houseName: house.houseName,
          orientation: house.orientation,
          proportion: house.proportion,
          price: house.price,
          coverImage: formatImageUrl(house.coverImage),
          status: house.status
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

function formatImageUrl(image) {
  if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image;
  }
  return `${BASE_URL}/api/images/houseCover/${image}`;
}

module.exports = {
  getHouseList
}; 