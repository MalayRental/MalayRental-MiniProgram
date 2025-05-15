/**
 * 用户信息和登录状态管理工具
 */
const { userAccountService } = require('../api/service/index');

// 存储键名
const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_INFO: 'userInfo',
  LOGIN_STATUS: 'loginStatus',
  PHONE_NUMBER: 'phoneNumber',
  OPEN_ID: 'openId'
};

// 登录状态
const LOGIN_STATUS = {
  LOGGED_IN: 'LOGGED_IN',
  NOT_LOGGED_IN: 'NOT_LOGGED_IN'
};

// 保存用户Token
const saveUserToken = (token) => {
  wx.setStorageSync(STORAGE_KEYS.USER_TOKEN, token);
};

// 获取用户Token
const getUserToken = () => {
  return wx.getStorageSync(STORAGE_KEYS.USER_TOKEN) || '';
};

// 保存用户手机号
const savePhoneNumber = (phoneNumber) => {
  wx.setStorageSync(STORAGE_KEYS.PHONE_NUMBER, phoneNumber);
};

// 获取用户手机号
const getPhoneNumber = () => {
  return wx.getStorageSync(STORAGE_KEYS.PHONE_NUMBER) || '';
};

// 保存用户信息
const saveUserInfo = (userInfo) => {
  wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
};

// 获取用户信息
const getUserInfo = () => {
  return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null;
};

// 设置登录状态
const setLoginStatus = (status) => {
  wx.setStorageSync(STORAGE_KEYS.LOGIN_STATUS, status);
};

// 获取登录状态
const getLoginStatus = () => {
  return wx.getStorageSync(STORAGE_KEYS.LOGIN_STATUS) || LOGIN_STATUS.NOT_LOGGED_IN;
};

// 是否已登录
const isLoggedIn = () => {
  return getLoginStatus() === LOGIN_STATUS.LOGGED_IN;
};

// 保存微信openId
const saveOpenId = (openId) => {
  wx.setStorageSync(STORAGE_KEYS.OPEN_ID, openId);
};

// 获取微信openId
const getOpenId = () => {
  return wx.getStorageSync(STORAGE_KEYS.OPEN_ID) || '';
};

// 保存登录信息
const saveLoginInfo = (loginData) => {
  if (!loginData) return;
  
  const { userToken, phoneNumber, userName, avatar, userId, role, tokenExpired, openId } = loginData;
  
  // 保存用户Token
  saveUserToken(userToken);
  
  // 保存手机号
  savePhoneNumber(phoneNumber);
  
  // 保存微信openId (如果有)
  if (openId) {
    saveOpenId(openId);
  }
  
  // 保存用户信息
  saveUserInfo({
    userName,
    avatar,
    userId,
    role,
    tokenExpired,
    phoneNumber,
    openId
  });
  
  // 设置登录状态为已登录
  setLoginStatus(LOGIN_STATUS.LOGGED_IN);
};

// 清除登录信息
const clearLoginInfo = () => {
  // 清除本地存储的信息
  wx.removeStorageSync(STORAGE_KEYS.USER_TOKEN);
  wx.removeStorageSync(STORAGE_KEYS.USER_INFO);
  wx.removeStorageSync(STORAGE_KEYS.PHONE_NUMBER);
  wx.removeStorageSync(STORAGE_KEYS.OPEN_ID);
  
  // 设置登录状态为未登录
  setLoginStatus(LOGIN_STATUS.NOT_LOGGED_IN);
};

// 格式化手机号显示
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.length !== 11) {
    return phoneNumber;
  }
  
  return phoneNumber.substring(0, 3) + '****' + phoneNumber.substring(7);
};

// 处理头像URL
const processAvatarUrl = (avatar) => {
  if (!avatar) return '/assets/images/default-avatar.png';
  
  // 如果是默认头像名称，直接返回本地默认头像
  if (avatar.includes('default-avatar.png')) {
    return '/assets/images/default-avatar.png';
  }
  
  // 如果已经是完整的URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // 如果是相对路径，检查是否以'/'开头
  if (!avatar.startsWith('/')) {
    return '/' + avatar;
  }
  
  return avatar;
};

// -----------登录相关函数--------------

/**
 * 检查登录状态
 * @param {Object} app 应用实例
 */
const checkLoginStatus = (app) => {
  // 检查本地是否有 loginStatus
  let loginStatus = wx.getStorageSync(STORAGE_KEYS.LOGIN_STATUS);
  if (!loginStatus) {
    wx.setStorageSync(STORAGE_KEYS.LOGIN_STATUS, LOGIN_STATUS.NOT_LOGGED_IN);
  }
  // 获取用户Token和手机号
  const userToken = getUserToken();
  const phoneNumber = getPhoneNumber();
  
  if (userToken && phoneNumber) {
    // 尝试自动登录
    autoLogin(phoneNumber, userToken, app);
  } else {
    // 设置未登录状态
    setNotLoggedIn(app);
    
    // 用户未登录，跳转到登录页面
    navigateToLogin();
  }
};

/**
 * 自动登录
 * @param {string} phoneNumber 手机号
 * @param {string} userToken 用户Token
 * @param {Object} app 应用实例
 */
const autoLogin = (phoneNumber, userToken, app) => {
  wx.showLoading({
    title: '登录中',
    mask: true
  });
  
  userAccountService.autoLogin({
    phoneNumber,
    userToken
  }).then(res => {
    wx.hideLoading();
    
    if (res.code === 200) {
      // 保存登录信息
      saveLoginInfo(res.data);
      
      // 获取用户信息
      const userInfo = getUserInfo();
      
      // 处理用户头像URL
      if (userInfo && userInfo.avatar) {
        userInfo.avatar = processAvatarUrl(userInfo.avatar);
      }
      
      // 设置全局数据
      setLoggedIn(app, userInfo);
      
      console.log('自动登录成功', userInfo);
    } else {
      // 自动登录失败
      handleLoginFailure(app);
    }
  }).catch(err => {
    wx.hideLoading();
    console.error('自动登录失败', err);
    
    // 自动登录失败处理
    handleLoginFailure(app);
  });
};

/**
 * 处理登录失败
 * @param {Object} app 应用实例
 */
const handleLoginFailure = (app) => {
  // 清除登录信息
  clearLoginInfo();
  
  // 设置未登录状态
  setNotLoggedIn(app);
  
  // 跳转到登录页面
  navigateToLogin();
  
  // 提示用户
  wx.showToast({
    title: '登录失效，请重新登录',
    icon: 'none'
  });
};

/**
 * 设置已登录状态
 * @param {Object} app 应用实例
 * @param {Object} userInfo 用户信息
 */
const setLoggedIn = (app, userInfo) => {
  if (app && app.globalData) {
    app.globalData.isLoggedIn = true;
    app.globalData.userInfo = userInfo;
  }
};

/**
 * 设置未登录状态
 * @param {Object} app 应用实例
 */
const setNotLoggedIn = (app) => {
  if (app && app.globalData) {
    app.globalData.isLoggedIn = false;
    app.globalData.userInfo = null;
  }
};

/**
 * 跳转到登录页面
 */
const navigateToLogin = () => {
  // 获取当前页面栈
  const pages = getCurrentPages();
  
  // 延迟跳转，避免在小程序启动初期造成多次跳转
  setTimeout(() => {
    // 如果不在登录或注册页面，则跳转到登录页面
    if (pages.length === 0) {
      // 小程序刚启动
      wx.navigateTo({
        url: '/pages/login/index'
      });
    } else {
      const currentPage = pages[pages.length - 1];
      const route = currentPage.route;
      
      if (route !== 'pages/login/index' && route !== 'pages/register/index') {
        wx.navigateTo({
          url: '/pages/login/index'
        });
      }
    }
  }, 500);
};

module.exports = {
  STORAGE_KEYS,
  LOGIN_STATUS,
  saveUserToken,
  getUserToken,
  saveUserInfo,
  getUserInfo,
  setLoginStatus,
  getLoginStatus,
  isLoggedIn,
  saveLoginInfo,
  clearLoginInfo,
  savePhoneNumber,
  getPhoneNumber,
  formatPhoneNumber,
  processAvatarUrl,
  // 新增导出函数
  checkLoginStatus,
  autoLogin,
  handleLoginFailure,
  setLoggedIn,
  setNotLoggedIn,
  navigateToLogin,
  saveOpenId,
  getOpenId
}; 