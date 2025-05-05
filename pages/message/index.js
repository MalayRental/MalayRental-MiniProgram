// 导入 API 模块
const { api, getCurrentUserId } = require('../../utils/request');
const { ensureFullAvatarUrl } = require('../../utils/dataAdapter');

Page({
  data: {
    messageList: [],
    navBarHeight: 0,
    loading: false,
    error: '',
    currentUserId: '', // 添加当前用户ID
    refreshTimer: null // 定时刷新的定时器
  },
  
  onLoad() {
    // 设置当前用户ID
    this.setData({
      currentUserId: getCurrentUserId()
    });
    
    this.fetchConversations();
    
    // 设置定时器，每1.5秒刷新一次会话列表
    const refreshTimer = setInterval(() => {
      this.fetchConversations(true); // 传入true表示静默刷新
    }, 1500);
    
    this.setData({ refreshTimer });
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
    // 重新加载会话列表，确保数据最新
    this.fetchConversations();
    
    // 如果定时器不存在，重新创建
    if (!this.data.refreshTimer) {
      const refreshTimer = setInterval(() => {
        this.fetchConversations(true); // 传入true表示静默刷新
      }, 1500);
      
      this.setData({ refreshTimer });
    }
  },
  
  onHide() {
    // 页面隐藏时清除定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
      this.setData({ refreshTimer: null });
    }
  },
  
  onUnload() {
    // 页面卸载时清除定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
    }
  },

  // 拉取会话列表
  fetchConversations(silent = false) {
    // 如果不是静默刷新，则显示加载状态
    if (!silent) {
      this.setData({ loading: true, error: '' });
    }
    
    api.getConversations()
      .then(res => {
        if (res.success && res.data) {
          console.log('会话列表数据:', res.data);
          
          // 将后端数据格式转换为前端需要的格式
          const formattedMessages = res.data.map(conv => ({
            id: conv.id,
            sender: {
              id: conv.userId,
              name: conv.userName,
              avatar: ensureFullAvatarUrl(conv.userAvatar)
            },
            lastMessage: conv.lastMessage,
            lastTime: this.formatTime(conv.lastMessageTime),
            unread: conv.unreadCount
          }));
          
          this.setData({
            messageList: formattedMessages,
            loading: false
          });
        } else {
          // 只有非静默刷新时才显示错误
          if (!silent) {
            this.setData({
              error: '获取消息列表失败',
              loading: false
            });
          }
        }
      })
      .catch(err => {
        console.error('获取消息列表出错：', err);
        // 只有非静默刷新时才显示错误
        if (!silent) {
          this.setData({
            error: err.message || '网络错误，请稍后再试',
            loading: false
          });
        }
      });
  },
  
  // 时间格式化函数
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const now = new Date();
    const msgTime = new Date(timeStr);
    
    // 如果是今天的消息，只显示时间
    if (now.toDateString() === msgTime.toDateString()) {
      return msgTime.getHours().toString().padStart(2, '0') + ':' + 
             msgTime.getMinutes().toString().padStart(2, '0');
    }
    
    // 如果是昨天的消息，显示"昨天"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === msgTime.toDateString()) {
      return '昨天';
    }
    
    // 如果是前天的消息，显示"前天"
    const beforeYesterday = new Date(now);
    beforeYesterday.setDate(now.getDate() - 2);
    if (beforeYesterday.toDateString() === msgTime.toDateString()) {
      return '前天';
    }
    
    // 如果是今年的消息，显示月-日
    if (now.getFullYear() === msgTime.getFullYear()) {
      return (msgTime.getMonth() + 1).toString().padStart(2, '0') + '-' + 
             msgTime.getDate().toString().padStart(2, '0');
    }
    
    // 否则显示年-月-日
    return msgTime.getFullYear() + '-' + 
           (msgTime.getMonth() + 1).toString().padStart(2, '0') + '-' + 
           msgTime.getDate().toString().padStart(2, '0');
  },
  
  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },
  
  onTapMessage(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/message/chat?id=${id}&name=${name}`
    });
  }
}); 