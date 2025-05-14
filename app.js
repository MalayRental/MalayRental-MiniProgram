// app.js
const userUtils = require('./utils/userUtils');

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
  }
})
