const app = getApp()

Page({
  data: {
    userId: null,
    inputValue: '', // 输入框的值
    scrollIntoView: '', // 滚动定位的消息ID
    contact: {
      id: 101,
      avatar: '/assets/images/avatar1.jpg',
      name: '李房东',
      userId: 'LD123456',
      online: true
    },
    navBarHeight: 0, // 导航栏高度
    messageListStyle: '', // 消息列表样式
    // 聊天消息列表
    messages: [
      {
        id: 'm1',
        content: '您好，请问这套房子还可以出租吗？',
        time: '10:00',
        isMine: false,
        avatar: '/assets/images/avatar1.jpg'
      },
      {
        id: 'm2',
        content: '您好，这套房子目前可以出租，您有兴趣看房吗？',
        time: '10:02',
        isMine: true,
        avatar: '/assets/images/user-avatar.jpg'
      },
      {
        id: 'm3',
        content: '有的，请问什么时候方便看房？',
        time: '10:05',
        isMine: false,
        avatar: '/assets/images/avatar1.jpg'
      },
      {
        id: 'm4',
        content: '我这周末都有时间，您看周六上午怎么样？',
        time: '10:10',
        isMine: true,
        avatar: '/assets/images/user-avatar.jpg'
      },
      {
        id: 'm5',
        content: '周六上午可以，具体地址在哪里？',
        time: '10:15',
        isMine: false,
        avatar: '/assets/images/avatar1.jpg'
      }
    ]
  },

  onLoad: function(options) {
    // 获取路由参数中的联系人ID
    const { id } = options;
    if (id) {
      this.setData({
        userId: id
      });
      
      // 这里应该根据ID请求后端获取聊天记录和联系人信息
      // 示例中使用静态数据
    }
    
    // 获取导航栏高度
    this.getNavBarHeight();
    
    // 滚动到最新消息
    this.scrollToBottom();
  },

  onReady: function() {
    // 滚动到最新消息
    this.scrollToBottom();
    
    // 调整消息列表高度
    this.adjustMessageListHeight();
  },
  
  // 获取导航栏高度
  getNavBarHeight: function() {
    const query = wx.createSelectorQuery();
    query.select('#navbar').boundingClientRect();
    query.exec(res => {
      if (res && res[0]) {
        this.setData({
          navBarHeight: res[0].height
        });
        
        // 动态调整消息列表高度
        this.adjustMessageListHeight();
      } else {
        // 备用方案：手动计算
        const systemInfo = wx.getSystemInfoSync();
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        
        // 状态栏高度
        const statusBarHeight = systemInfo.statusBarHeight;
        // 导航栏高度 = 状态栏高度 + 胶囊按钮到状态栏的距离 * 2 + 胶囊高度
        const navBarHeight = statusBarHeight + (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
        
        this.setData({
          navBarHeight
        });
        
        // 动态调整消息列表高度
        this.adjustMessageListHeight();
      }
    });
  },
  
  // 调整消息列表高度
  adjustMessageListHeight: function() {
    const systemInfo = wx.getSystemInfoSync();
    // 不再减去输入框高度，因为输入框现在固定在底部
    const availableHeight = systemInfo.windowHeight - this.data.navBarHeight - 128;
    this.setData({
      messageListStyle: `max-height: ${availableHeight}px;`
    });
  },

  // 发送消息
  sendMessage: function() {
    if (!this.data.inputValue.trim()) return;
    
    const newMessage = {
      id: 'm' + (this.data.messages.length + 1),
      content: this.data.inputValue,
      time: this.getCurrentTime(),
      isMine: true,
      avatar: '/assets/images/user-avatar.jpg'
    };
    
    const messages = [...this.data.messages, newMessage];
    
    this.setData({
      messages,
      inputValue: ''
    }, () => {
      // 发送消息后滚动到底部
      this.scrollToBottom();
      
      // 模拟对方回复
      setTimeout(() => {
        this.receiveMessage();
      }, 1000);
    });
  },

  // 模拟接收消息
  receiveMessage: function() {
    const replyMessages = [
      '好的，我明白了',
      '没问题，到时见',
      '请问还有其他问题吗？',
      '这套房子的位置很好，周边设施齐全',
      '可以，我会安排的'
    ];
    
    const randomIndex = Math.floor(Math.random() * replyMessages.length);
    const newMessage = {
      id: 'm' + (this.data.messages.length + 1),
      content: replyMessages[randomIndex],
      time: this.getCurrentTime(),
      isMine: false,
      avatar: '/assets/images/avatar1.jpg'
    };
    
    const messages = [...this.data.messages, newMessage];
    
    this.setData({
      messages
    }, () => {
      // 接收消息后滚动到底部
      this.scrollToBottom();
    });
  },

  // 处理输入框内容变化
  handleInputChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 获取当前时间
  getCurrentTime: function() {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  },

  // 滚动到底部
  scrollToBottom: function() {
    if (this.data.messages.length > 0) {
      const lastMessageId = this.data.messages[this.data.messages.length - 1].id;
      this.setData({
        scrollIntoView: lastMessageId
      });
    }
  }
}) 