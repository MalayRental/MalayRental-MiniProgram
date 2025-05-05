Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/home/index",
        text: "首页",
        icon: "home",
        selectedIcon: "home"
      },
      {
        pagePath: "/pages/message/index",
        text: "消息",
        icon: "chat",
        selectedIcon: "chat"
      },
      {
        pagePath: "/pages/mine/index",
        text: "我的",
        icon: "user",
        selectedIcon: "user"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      
      wx.switchTab({
        url
      });
      
      this.setData({
        selected: data.index
      }); 
    }
  }
}); 