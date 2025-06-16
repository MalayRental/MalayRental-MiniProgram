const app = getApp()

Page({
  data: {
    // 页面数据
  },

  onLoad: function() {
    // 页面加载时的逻辑
  },
  
  // 分享小程序
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