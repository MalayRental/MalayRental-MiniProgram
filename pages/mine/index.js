// pages/mine/index.js
const { ensureFullAvatarUrl } = require('../../utils/dataAdapter');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatar: 'images/default-avatar.png',
      name: '登录/注册',
      phone: '未登录'
    },
    isLoggedIn: false,
    navBarHeight: 0,
    useDefaultAvatar: true // 添加标志，表示是否使用默认头像图标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
    // 每次进入页面都检查登录状态，以便在登录后立即更新
    this.checkLoginStatus();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo') || null;
    
    if (isLoggedIn && userInfo) {
      // 组装用户信息显示数据
      let avatarPath = 'images/default-avatar.png'; // 默认使用本地头像
      let useDefaultAvatar = true; // 默认使用图标
      
      // 只有当头像不是default且不为空时，才使用ensureFullAvatarUrl处理
      if (userInfo.avatar && userInfo.avatar !== 'default') {
        avatarPath = ensureFullAvatarUrl(userInfo.avatar);
        useDefaultAvatar = false; // 使用实际头像图片
      }
      
      const displayUserInfo = {
        avatar: avatarPath,
        name: userInfo.username || '用户',
        phone: userInfo.account || ''
      };
      
      this.setData({
        isLoggedIn: true,
        userInfo: displayUserInfo,
        useDefaultAvatar
      });
      
      console.log('用户已登录，信息:', displayUserInfo, '使用默认头像图标:', useDefaultAvatar);
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: {
          avatar: 'images/default-avatar.png',
          name: '登录/注册',
          phone: '未登录'
        },
        useDefaultAvatar: true // 未登录时使用默认图标
      });
      
      console.log('用户未登录');
    }
  },

  // 处理用户信息点击事件
  handleUserInfoClick() {
    if (!this.data.isLoggedIn) {
      // 未登录，跳转到登录页
      wx.navigateTo({
        url: '/pages/login/index?from=mine'
      });
    }
  },

  navigateTo(e) {
    const { url } = e.currentTarget.dataset;
    
    // 如果需要登录权限的页面，先检查登录状态
    if (url.includes('favorites') || url.includes('history') || url.includes('appointments') || url.includes('edit-profile')) {
      if (!this.data.isLoggedIn) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index?from=mine'
          });
        }, 1000);
        return;
      }
    }
    
    wx.navigateTo({
      url
    });
  },

  showToast(e) {
    const { message } = e.currentTarget.dataset;
    wx.showToast({
      title: message,
      icon: 'none'
    });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的登录信息
          wx.removeStorageSync('isLoggedIn');
          wx.removeStorageSync('userInfo');
          
          // 更新页面显示
          this.setData({
            isLoggedIn: false,
            userInfo: {
              avatar: 'images/default-avatar.png',
              name: '登录/注册',
              phone: '未登录'
            }
          });
          
          wx.showToast({
            title: '退出成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  }
})