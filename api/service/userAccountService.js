/**
 * 用户账户相关服务
 */
const { API } = require('../api');
const request = require('../request');

/**
 * 用户登录
 * @param {Object} params 登录参数
 * @param {string} params.phoneNumber 手机号
 * @param {string} params.password 密码
 * @returns {Promise} 返回登录结果的Promise
 */
const login = (params) => {
  const { phoneNumber, password } = params;
  
  const data = {
    message: "用户登录",
    timestamp: Date.now(),
    data: {
      phoneNumber,
      password
    }
  };
  
  return request.post(API.USER.LOGIN, data);
};

/**
 * 自动登录
 * @param {Object} params 自动登录参数
 * @param {string} params.phoneNumber 手机号
 * @param {string} params.userToken 用户Token
 * @returns {Promise} 返回自动登录结果的Promise
 */
const autoLogin = (params) => {
  const { phoneNumber, userToken } = params;
  
  const data = {
    message: "用户自动登录",
    timestamp: Date.now(),
    data: {
      phoneNumber,
      userToken
    }
  };
  
  return request.post(API.USER.AUTO_LOGIN, data);
};

/**
 * 用户注册
 * @param {Object} params 注册参数
 * @param {string} params.phoneNumber 手机号
 * @param {string} params.password 密码
 * @param {string} params.userName 用户名/昵称
 * @returns {Promise} 返回注册结果的Promise
 */
const register = (params) => {
  const { phoneNumber, password, userName } = params;
  
  const data = {
    message: "注册用户",
    timestamp: Date.now(),
    data: {
      userName,
      phoneNumber,
      avatar: "default-avatar.png",
      password
    }
  };
  
  return request.post(API.USER.REGISTER, data);
};

/**
 * 登出
 * @returns {Promise} 返回登出结果的Promise
 */
const logout = () => {
  const data = {
    message: "用户登出",
    timestamp: Date.now(),
    data: {}
  };
  
  return request.post(API.USER.LOGOUT, data);
};

/**
 * 微信一键登录
 * @param {Object} params 微信登录参数
 * @param {string} params.code 微信登录获取的code
 * @returns {Promise} 返回微信登录结果的Promise
 */
const wxLogin = (params) => {
  const { code } = params;
  
  const data = {
    message: "微信一键登录",
    timestamp: Date.now(),
    data: {
      code
    }
  };
  
  return request.post(API.USER.WX_LOGIN, data);
};

/**
 * 微信注册账号
 * @param {Object} params 微信注册参数
 * @param {string} params.openId 微信openId
 * @param {string} params.userName 用户名/昵称
 * @param {string} params.phoneNumber 手机号
 * @returns {Promise} 返回注册结果的Promise
 */
const wxRegister = (params) => {
  const { openId, userName, phoneNumber } = params;
  
  // 生成32位随机密码
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 32; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  
  const data = {
    message: "注册用户",
    timestamp: Date.now(),
    data: {
      openId,
      userName,
      phoneNumber,
      avatar: "default-avatar.png",
      password: generateRandomPassword()
    }
  };
  
  return request.post(API.USER.REGISTER, data);
};

module.exports = {
  login,
  autoLogin,
  register,
  logout,
  wxLogin,
  wxRegister
}; 