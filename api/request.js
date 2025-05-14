// request.js
// 通用HTTP请求工具

const { BASE_URL } = require('./api');

/**
 * 封装微信请求API
 * @param {String} url - 请求地址
 * @param {String} method - 请求方法
 * @param {Object} data - 请求数据
 * @param {Object} header - 请求头
 * @returns {Promise} Promise对象
 */
const request = (url, method, data = {}, header = {}) => {
  // 添加时间戳
  const requestData = {
    ...data,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data: requestData,
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || '',
        ...header
      },
      success: (res) => {
        const { statusCode, data } = res;
        
        // 请求成功 - 包括code 200的标准成功、code 201的未注册状态和code 400的业务错误
        if (statusCode === 200 && (data.code === 200 || data.code === 201 || data.code === 400)) {
          resolve(data);
        } else if (statusCode === 401 || data.code === 401) {
          // token过期，重新登录
          wx.removeStorageSync('token');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          // 可以在这里跳转到登录页面
          // wx.navigateTo({ url: '/pages/login/index' });
          reject(data.message || '登录已过期');
        } else {
          // 其他错误
          wx.showToast({
            title: data.message || '请求失败',
            icon: 'none'
          });
          reject(data.message || '请求失败');
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 导出请求方法
module.exports = {
  get: (url, data) => request(url, 'GET', data),
  post: (url, data) => request(url, 'POST', data),
  put: (url, data) => request(url, 'PUT', data),
  delete: (url, data) => request(url, 'DELETE', data)
}; 