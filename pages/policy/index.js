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
      title: '马来租房 - 隐私政策',
      path: '/pages/policy/index',
      imageUrl: '/assets/images/share-image.png'
    };
  }
}) 