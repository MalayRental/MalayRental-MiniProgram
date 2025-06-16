const app = getApp()

Page({
  data: {
    userCard: {
      avatar: '/assets/images/user-avatar.jpg',
      name: '林小明',
      gender: '男',
      phone: '13512345678',
      email: 'linxiaoming@example.com',
      school: '马来西亚国际大学'
    }
  },

  onLoad: function() {
    // 初始化数据
  },

  // 编辑按钮点击
  handleEditTap: function() {
    wx.showModal({
      title: '提示',
      content: '请转到账号资料页面，进行相关资料修改',
      cancelText: '取消',
      confirmText: '前往',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/accountInfo/index'
          })
        }
      }
    })
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