Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/home/index",
        text: "首页",
        iconPath: "/assets/icons/home.png"
      },
      {
        pagePath: "/pages/chatList/index",
        text: "消息",
        iconPath: "/assets/icons/message.png"
      },
      {
        pagePath: "/pages/mine/index",
        text: "我的",
        iconPath: "/assets/icons/mine.png"
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
    }
  }
}) 