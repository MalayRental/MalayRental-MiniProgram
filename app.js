// app.js
const userUtils = require('./utils/userUtils');
const websocket = require('./utils/websocket');

App({
  globalData: {
    isLoggedIn: false, // 是否已登录
    userInfo: null // 用户信息
  },
  
  onLaunch: function() {
    // 获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.system = res
      }
    })
    // 获取胶囊信息
    this.menu = wx.getMenuButtonBoundingClientRect()
    // 打印数据
    console.log('系统信息', this.system)
    console.log('胶囊信息', this.menu)
    
    // 检查登录状态
    userUtils.checkLoginStatus(this);
    // 检查自动登录后是否已登录，已登录则建立WebSocket
    if (userUtils.isLoggedIn()) {
      websocket.connectWebSocket();
    }
  }
})

// 登录成功后也要建立WebSocket
userUtils.onLoginSuccess = function() {
  websocket.connectWebSocket();
};
