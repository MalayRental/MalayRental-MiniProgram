// api.js
// 定义基础URL和API URL常量

// 基础URL
const BASE_URL = 'http://192.168.1.9:8080';

// API URL常量
const API = {
  // Banner相关
  BANNER: {
    GET_BANNER_LIST: '/api/miniInfo/getBannerList',
  },
  // 用户相关
  USER: {
    LOGIN: '/api/user/login',
    AUTO_LOGIN: '/api/user/autoLogin',
    LOGOUT: '/api/user/logout',
    REGISTER: '/api/user/register',
    WX_LOGIN: '/api/user/wxLogin',
    SEND_CODE: '/api/user/sendCode',
    GET_USER_INFO: '/api/user/info',
    UPDATE_USER_INFO: '/api/user/update',
  },
  // 房源相关
  HOUSE: {
    GET_HOUSE_LIST: '/api/house/list',
    GET_HOUSE_DETAIL: '/api/house/detail',
    FAVORITE_HOUSE: '/api/house/favorite',
    GET_FAVORITE_LIST: '/api/user/favorites',
    GET_HISTORY_LIST: '/api/user/history',
  },
  // 聊天相关
  CHAT: {
    GET_CHAT_LIST: '/api/chat/list',
    GET_CHAT_HISTORY: '/api/chat/history',
    MARK_AS_READ: '/api/chat/read',
  },
};

module.exports = {
  BASE_URL,
  API
}; 