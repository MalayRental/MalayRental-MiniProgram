// app.js
const { api } = require('./utils/request');

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态
    this.checkLoginStatus();
    
    // 获取设备信息
    try {
      // 使用新的API代替wx.getSystemInfoSync
      const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
      const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
      const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
      
      // 合并信息到一个对象中，保持与旧API的兼容性
      const combinedInfo = {
        ...windowInfo,
        ...appBaseInfo,
        ...deviceInfo
      };
      
      // 新API某些关键属性可能不存在，需要进行检查
      if (!combinedInfo.statusBarHeight && windowInfo.statusBarHeight) {
        combinedInfo.statusBarHeight = windowInfo.statusBarHeight;
      }
      
      this.globalData.systemInfo = combinedInfo;
      
      // 获取导航栏高度
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      this.globalData.statusBarHeight = windowInfo.statusBarHeight || 0;
      this.globalData.menuButtonHeight = menuButtonInfo.height || 0;
      this.globalData.menuButtonWidth = menuButtonInfo.width || 0;
    } catch (e) {
      console.error('获取设备信息失败', e);
      // 降级处理，使用旧API
      this.getFallbackSystemInfo();
    }
  },
  
  // 检查登录状态
  checkLoginStatus() {
    // 获取本地存储的登录状态和用户信息
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo');
    
    if (isLoggedIn && userInfo) {
      // 用户已登录，更新全局状态
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
      console.log('用户已登录，信息:', userInfo);
    } else {
      // 用户未登录，不自动尝试微信登录
      console.log('用户未登录，等待用户手动登录');
      // 确保全局状态保持未登录
      this.globalData.userInfo = null;
      this.globalData.isLoggedIn = false;
      // 清除可能存在的登录信息
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('isLoggedIn');
    }
  },
  
  // 尝试使用微信登录
  tryWxLogin() {
    // 使用wx.login获取临时登录凭证code
    wx.login({
      success: res => {
        // 如果获取到code，则直接尝试自动注册/登录
        if (res.code) {
          console.log('获取微信登录code成功:', res.code);
          
          // 使用一次性登录，内部会处理账号检查和自动注册
          api.autoRegisterWithWx(res.code)
            .then(loginRes => {
              // 登录成功，保存用户信息
              if (loginRes.success && loginRes.user) {
                wx.setStorageSync('userInfo', loginRes.user);
                wx.setStorageSync('isLoggedIn', true);
                
                this.globalData.userInfo = loginRes.user;
                this.globalData.isLoggedIn = true;
                
                console.log('微信登录成功，用户信息:', loginRes.user);
              }
            })
            .catch(err => {
              console.error('微信登录失败:', err);
              // 登录失败清除存储信息
              wx.removeStorageSync('userInfo');
              wx.removeStorageSync('isLoggedIn');
              this.globalData.userInfo = null;
              this.globalData.isLoggedIn = false;
            });
        } else {
          console.error('获取微信登录code失败:', res.errMsg);
          // 获取code失败也需要清除存储信息
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('isLoggedIn');
          this.globalData.userInfo = null;
          this.globalData.isLoggedIn = false;
        }
      },
      fail: err => {
        console.error('wx.login调用失败:', err);
        // wx.login调用失败也需要清除存储信息
        wx.removeStorageSync('userInfo');
        wx.removeStorageSync('isLoggedIn');
        this.globalData.userInfo = null;
        this.globalData.isLoggedIn = false;
      }
    });
  },
  
  // 获取用户信息（包括头像、昵称等）并更新到服务器
  // 新版微信小程序需要使用开放能力按钮获取用户信息
  updateWxUserInfo(userInfo) {
    if (!this.globalData.isLoggedIn) {
      console.error('用户未登录，无法更新用户信息');
      return Promise.reject('用户未登录');
    }
    
    // 构建更新数据
    const updateData = {
      nickname: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
    };
    
    // 调用API更新用户信息
    return api.updateUserInfo(updateData)
      .then(res => {
        if (res.success) {
          // 更新本地存储的用户信息
          const currentUserInfo = wx.getStorageSync('userInfo') || {};
          const updatedUserInfo = {
            ...currentUserInfo,
            nickname: userInfo.nickName,
            avatar: userInfo.avatarUrl,
            gender: userInfo.gender
          };
          
          wx.setStorageSync('userInfo', updatedUserInfo);
          this.globalData.userInfo = updatedUserInfo;
          
          console.log('用户信息更新成功:', updatedUserInfo);
          return Promise.resolve(updatedUserInfo);
        } else {
          return Promise.reject(res.message || '更新失败');
        }
      });
  },
  
  getFallbackSystemInfo() {
    try {
      // 尝试使用其他较新的API获取信息
      let windowInfo = {};
      let appBaseInfo = {};
      let deviceInfo = {};
      
      // 尝试获取各类信息
      try { windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {}; } catch (err) {}
      try { appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {}; } catch (err) {}
      try { deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {}; } catch (err) {}
      
      // 合并信息
      const systemInfo = {
        ...windowInfo,
        ...appBaseInfo,
        ...deviceInfo
      };
      
      this.globalData.systemInfo = systemInfo;
      
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      this.globalData.statusBarHeight = windowInfo.statusBarHeight || 0;
      this.globalData.menuButtonHeight = menuButtonInfo.height || 0;
      this.globalData.menuButtonWidth = menuButtonInfo.width || 0;
    } catch (e) {
      console.error('降级获取设备信息也失败', e);
      // 设置默认值防止应用崩溃
      this.globalData.systemInfo = {};
      this.globalData.statusBarHeight = 20;
    }
  },
  
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    systemInfo: null,
    statusBarHeight: 0,
    menuButtonHeight: 0,
    menuButtonWidth: 0
  }
})
