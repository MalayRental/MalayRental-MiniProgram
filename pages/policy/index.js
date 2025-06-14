const app = getApp()

Page({
  onLoad: function() {
    // 页面加载时的逻辑
  },
  
  // 分享小程序
  onShareAppMessage: function() {
    return {
      title: '马来租房 - 隐私保护指引',
      path: '/pages/policy/index',
      imageUrl: '/assets/images/share-image.png'
    };
  }
}) 