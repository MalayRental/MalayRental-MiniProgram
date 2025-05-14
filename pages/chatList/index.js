const app = getApp()

Page({
  data: {
    searchValue: '', // 搜索框的值
    chatList: [
      {
        id: 1,
        avatar: '/assets/images/avatar1.jpg',
        userName: '李房东',
        lastMessage: '您好，这套房子还可以出租吗？',
        lastMessageTime: '10:30',
        unread: 2
      },
      {
        id: 2,
        avatar: '/assets/images/avatar2.jpg',
        userName: '张经纪',
        lastMessage: '请问您对这套房子感兴趣吗？价格可以商量',
        lastMessageTime: '昨天',
        unread: 0
      },
      {
        id: 3,
        avatar: '/assets/images/avatar3.jpg',
        userName: '王中介',
        lastMessage: '好的，我明天安排您看房',
        lastMessageTime: '前天',
        unread: 0
      },
      {
        id: 4,
        avatar: '/assets/images/avatar4.jpg',
        userName: '赵客服',
        lastMessage: '您的预约已确认，请准时到达',
        lastMessageTime: '星期一',
        unread: 1
      }
    ],
    filteredChatList: [] // 过滤后的聊天列表
  },

  onLoad: function() {
    this.setData({
      filteredChatList: this.data.chatList
    });
  },

  onShow: function() {
    // 设置当前页面底部导航选中状态
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.setData({
          selected: 1 // 消息页面的索引
        });
      }
    }
  },

  // 处理搜索框输入
  handleSearchInput: function(e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value
    });
    this.filterChatList(value);
  },

  // 清空搜索框
  clearSearch: function() {
    this.setData({
      searchValue: ''
    });
    this.filterChatList('');
  },

  // 根据输入过滤聊天列表
  filterChatList: function(keyword) {
    if (!keyword) {
      this.setData({
        filteredChatList: this.data.chatList
      });
      return;
    }

    const filtered = this.data.chatList.filter(item => {
      return item.userName.indexOf(keyword) !== -1;
    });

    this.setData({
      filteredChatList: filtered
    });
  },

  // 跳转到聊天页面
  navigateToChat: function(e) {
    const { chatid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/chatOnline/index?id=${chatid}`
    });
  }
}) 