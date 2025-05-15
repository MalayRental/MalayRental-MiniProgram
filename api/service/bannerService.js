const { post } = require('../request');
const { API, BASE_URL } = require('../api');

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
        // 处理图片路径 - 如果需要拼接完整URL，可以在这里处理
        const banners = data.map(banner => {
          return {
            id: banner.bannerId,
            image: formatImageUrl(banner.image),
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

const formatImageUrl = (imageUrl) => {
  // 如果是完整URL（以http或https开头），则直接返回
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  
  // 拼接图片服务器地址和前缀路径
  return `${BASE_URL}/api/images/banner/${imageUrl}`;
};

module.exports = {
  getBannerList
}; 