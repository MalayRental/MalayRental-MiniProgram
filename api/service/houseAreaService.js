// houseAreaService.js
// 区域（位置）服务，获取区域列表

const { post } = require('../request');
const { API } = require('../api');

/**
 * 获取区域（位置）列表
 * @returns {Promise} 返回区域列表Promise
 */
const getAreaList = () => {
  const requestData = {
    message: "获取区域列表", // 按接口要求
    data: null
  };

  // 发送请求
  return post('/api/area/getAreaList', requestData)
    .then(response => {
      const { data, code, message } = response;
      if (code === 200) {
        // 返回格式化后的区域列表
        return data.map(area => ({
          id: area.areaId,
          name: area.areaName
        }));
      } else {
        return Promise.reject(message || '获取区域列表失败');
      }
    })
    .catch(error => {
      console.error('获取区域列表失败:', error);
      return Promise.reject(error);
    });
};

module.exports = {
  getAreaList
}; 