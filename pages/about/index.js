const app = getApp()

Page({
  data: {
    // 页面数据
  },

  onLoad: function() {
    // 页面加载时的逻辑
  },
  
  // 分享小程序
  onShareAppMessage: function() {
    return {
      title: '马来租房 - 让您在马来西亚租房更简单、更安心',
      path: '/pages/home/index',
      imageUrl: '/assets/images/share-image.png'
    };
  }
}) 