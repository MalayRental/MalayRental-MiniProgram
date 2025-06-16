const app = getApp()

// 与我们合作页面
Page({
  data: {
    // 页面数据
  },

  onLoad: function() {
    // 页面加载时的逻辑
  },
  
  // 联系我们
  contactUs: function() {
    wx.showActionSheet({
      itemList: ['拨打电话', '发送邮件', '复制邮箱地址'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 拨打电话
          wx.makePhoneCall({
            phoneNumber: '+60123456789',
            fail: () => {
              wx.showToast({
                title: '拨号取消',
                icon: 'none'
              });
            }
          });
        } else if (res.tapIndex === 1) {
          // 提示
          wx.showToast({
            title: '请使用邮件应用发送邮件',
            icon: 'none'
          });
        } else if (res.tapIndex === 2) {
          // 复制邮箱
          wx.setClipboardData({
            data: 'business@malayrental.com',
            success: () => {
              wx.showToast({
                title: '邮箱已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  onShareAppMessage: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      path: '/pages/home/index',
      imageUrl: ''
    }
  },

  onShareTimeline: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      query: '',
      imageUrl: ''
    }
  }
}) 