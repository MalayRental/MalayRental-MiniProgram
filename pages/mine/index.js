const app = getApp()
const userUtils = require('../../utils/userUtils');

Page({
  data: {
    isLoggedIn: false, // 是否已登录
    // 用户信息
    userInfo: null,
    // 格式化后的手机号
    formattedPhoneNumber: '',
    // 功能菜单项
    menuItems: [
      { 
        id: 1, 
        icon: '/assets/icons/card.png', 
        text: '我的名片', 
        url: '/pages/businessCard/index',
        needLogin: true
      },
      { 
        id: 2, 
        icon: '/assets/icons/account.png', 
        text: '账号资料', 
        url: '/pages/accountInfo/index',
        needLogin: true
      },
      { 
        id: 3, 
        icon: '/assets/icons/cooperation.png', 
        text: '与我们合作', 
        url: '/pages/collaboration/index',
        needLogin: false
      },
      { 
        id: 4, 
        icon: '/assets/icons/feedback.png', 
        text: '意见反馈', 
        url: '/pages/feedback/index',
        needLogin: false
      },
      { 
        id: 5, 
        icon: '/assets/icons/policy.png', 
        text: '隐私政策', 
        url: '/pages/policy/index',
        needLogin: false
      },
      { 
        id: 6, 
        icon: '/assets/icons/about.png', 
        text: '关于马来租房', 
        url: '/pages/about/index',
        needLogin: false
      }
    ],
    // 收藏和历史
    collections: [
      { id: 1, text: '我的收藏', icon: '/assets/icons/star.png', count: 0 },
      { id: 2, text: '浏览历史', icon: '/assets/icons/history.png', count: 0 }
    ]
  },

  onLoad: function() {
    // 初始化页面数据
    this.initPageData();
  },

  onShow: function() {
    // 每次显示页面时更新数据
    this.initPageData();
    
    // 设置当前页面底部导航选中状态
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.setData({
          selected: 2 // 我的页面的索引
        });
      }
    }
  },
  
  // 初始化页面数据
  initPageData: function() {
    // 检查登录状态
    const isLoggedIn = app.globalData.isLoggedIn;
    const userInfo = app.globalData.userInfo;
    
    // 处理用户头像URL
    if (userInfo && userInfo.avatar) {
      userInfo.avatar = userUtils.processAvatarUrl(userInfo.avatar);
    }
    
    // 格式化手机号
    let formattedPhoneNumber = '';
    if (userInfo && userInfo.phoneNumber) {
      formattedPhoneNumber = userUtils.formatPhoneNumber(userInfo.phoneNumber);
    }
    
    this.setData({
      isLoggedIn,
      userInfo,
      formattedPhoneNumber
    });
  },

  // 跳转到用户信息编辑页面
  navigateToEdit: function() {
    // 检查登录状态
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    wx.navigateTo({
      url: '/pages/accountInfo/index'
    });
  },

  // 跳转到菜单项对应的页面
  navigateToMenuPage: function(e) {
    const { url, needlogin } = e.currentTarget.dataset;
    
    // 检查是否需要登录
    if (needlogin === 'true' && !this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    wx.navigateTo({
      url: url
    });
  },

  // 跳转到收藏或历史页面
  navigateToCollection: function(e) {
    // 检查登录状态
    if (!this.data.isLoggedIn) {
      this.navigateToLogin();
      return;
    }
    
    const { id } = e.currentTarget.dataset;
    // 根据ID判断是收藏还是历史
    if (id === 1) {
      // 收藏
      wx.navigateTo({
        url: '/pages/favorites/index'
      });
    } else {
      // 历史
      wx.navigateTo({
        url: '/pages/history/index'
      });
    }
  },
  
  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },
  
  // 退出登录
  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          userUtils.clearLoginInfo();
          
          // 更新全局数据
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          
          // 更新页面数据
          this.setData({
            isLoggedIn: false,
            userInfo: null
          });
          
          // 提示用户
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  }
}) 