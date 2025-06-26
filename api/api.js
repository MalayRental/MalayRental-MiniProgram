// api.js
// 定义基础URL和API URL常量

// 基础URL
const BASE_URL = 'https://api.malayrental.cn:9947';
// const BASE_URL = 'http://192.168.1.17:8080';

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
    WX_LOGIN: '/api/user/wxLogin'
  },
  // 房源相关
  HOUSE: {
    GET_HOUSE_LIST: '/api/house/list',
    GET_HOUSE_DETAIL: '/api/house/detail'
  },
  // 聊天相关
  CHAT: {
    GET_CHAT_LIST: '/api/chat/getChatList',
    CREATE_CHAT: '/api/chat/createChat',
  },
  // 收藏相关
  FAVORITE: {
    GET_FAVORITE_LIST: '/api/favorite/getFavoriteList',
    ADD_FAVORITE_ITEM: '/api/favorite/addFavoriteItem',
    REMOVE_FAVORITE_ITEM: '/api/favorite/removeFavoriteItem',
    CHECK_FAVORITE_STATUS: '/api/favorite/checkFavoriteStatus',
  },
  // 历史浏览相关
  HISTORY: {
    GET_HISTORY_LIST: '/api/history/getHistoryList'
  },
};

module.exports = {
  BASE_URL,
  API
}; 