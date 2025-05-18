const { BASE_URL } = require('../api');

/**
 * 获取图片完整URL
 * @param {string} type 图片类型 avatar/houseCover/houseDetail/chat/banner
 * @param {string} filename 文件名
 * @returns {string} 完整图片URL
 */
function getImageUrl(type, filename) {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  if (filename.includes('default-avatar.png')) {
    return '/assets/images/default-avatar.png';
  }
  let path = '';
  switch (type) {
    case 'avatar':
      path = '/api/images/avatar/';
      break;
    case 'houseCover':
      path = '/api/images/houseCover/';
      break;
    case 'houseDetail':
      path = '/api/images/houseDetail/';
      break;
    case 'chat':
      path = '/api/images/chat/';
      break;
    case 'banner':
      path = '/api/images/banner/';
      break;
    default:
      path = '/api/images/';
  }
  return BASE_URL + path + filename;
}

module.exports = {
  getImageUrl
}; 