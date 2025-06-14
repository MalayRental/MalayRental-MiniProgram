const app = getApp()

Page({
  data: {
    activeTab: 'privacy' // 默认显示隐私政策
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
  },

  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab && tab !== this.data.activeTab) {
      this.setData({ activeTab: tab });
    }
  }
}) 