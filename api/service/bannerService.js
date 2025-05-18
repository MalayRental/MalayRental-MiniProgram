const { post } = require('../request');
const { API } = require('../api');
const { getImageUrl } = require('./imageGetService');

const getBannerList = () => {
  // 构建请求体
  const requestData = {
    message: "获取Banner图列表",
    data: null
  };
  
  // 发送请求
  return post(API.BANNER.GET_BANNER_LIST, requestData)
    .then(response => {
      // 处理响应数据
      const { data, code, message } = response;
      
      if (code === 200) {
        // 处理图片路径
        const banners = data.map(banner => {
          return {
            id: banner.bannerId,
            image: getImageUrl('banner', banner.image),
            link: banner.link === "null" ? null : banner.link
          };
        });
        
        return banners;
      } else {
        // 返回错误信息
        return Promise.reject(message || '获取Banner图失败');
      }
    })
    .catch(error => {
      console.error('获取Banner图失败:', error);
      return Promise.reject(error);
    });
};

module.exports = {
  getBannerList
}; 