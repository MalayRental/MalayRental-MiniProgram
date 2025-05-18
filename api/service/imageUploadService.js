const { BASE_URL } = require('../api');
const { getUserInfo } = require('../../utils/userUtils');

/**
 * 上传头像
 * @param {string} filePath 本地图片路径
 * @returns {Promise}
 */
const uploadAvatar = (filePath) => {
  const userInfo = getUserInfo();
  const runUser = userInfo && userInfo.userId ? userInfo.userId : '';
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: BASE_URL + '/api/images/upload/avatar',
      filePath: filePath,
      name: 'file',
      formData: {
        runUser
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            resolve(data);
          } else {
            reject(data.message || '上传失败');
          }
        } catch (e) {
          reject('上传失败');
        }
      },
      fail: (err) => {
        reject('上传失败');
      }
    });
  });
};

module.exports = {
  uploadAvatar
}; 