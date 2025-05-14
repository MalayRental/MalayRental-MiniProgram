// 导入 API 模块
const { api, getCurrentUserId } = require('../../utils/request');
const { ensureFullAvatarUrl } = require('../../utils/dataAdapter');

Page({
  data: {
    messageList: [],
    navBarHeight: 0,
    loading: false,
    error: '',
    currentUserId: '',
    refreshTimer: null,
    isLoggedIn: false,
    lastUpdated: 0,
    isRefreshing: false,
    hasNetworkError: false
  },
  
  onLoad() {
    this.setupNetworkListener();
    this.initPageData();
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
    
    this.initPageData();
  },
  
  // 初始化页面数据和定时器
  initPageData() {
    this.checkLoginStatus();
    
    if (this.data.isLoggedIn) {
      this.fetchConversations();
      this.startRefreshTimer();
    }
  },
  
  onHide() {
    this.clearRefreshTimer();
  },
  
  onUnload() {
    this.clearRefreshTimer();
    this.cleanupNetworkListener();
  },

  setupNetworkListener() {
    wx.onNetworkStatusChange(res => {
      const newNetworkState = !res.isConnected;
      
      // 只有网络状态发生变化时才更新
      if (newNetworkState !== this.data.hasNetworkError) {
        this.setData({ hasNetworkError: newNetworkState });
        
        // 网络恢复且已登录，刷新数据
        if (!newNetworkState && this.data.isLoggedIn) {
          this.fetchConversations();
        }
      }
    });
  },

  cleanupNetworkListener() {
    wx.offNetworkStatusChange();
  },

  startRefreshTimer() {
    this.clearRefreshTimer();
    
    const refreshTimer = setInterval(() => {
      if (!this.data.hasNetworkError) {
        this.fetchConversations(true);
      }
    }, 1500);
    
    this.setData({ refreshTimer });
  },
  
  clearRefreshTimer() {
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
      this.setData({ refreshTimer: null });
    }
  },

  onPullDownRefresh() {
    if (!this.data.isLoggedIn) {
      wx.stopPullDownRefresh();
      return;
    }
    
    this.setData({ isRefreshing: true });
    this.fetchConversations()
      .finally(() => {
        this.setData({ isRefreshing: false });
        wx.stopPullDownRefresh();
      });
  },

  checkLoginStatus() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    const userInfo = wx.getStorageSync('userInfo') || null;
    
    const loginState = {
      isLoggedIn: false,
      currentUserId: ''
    };
    
    if (isLoggedIn && userInfo) {
      loginState.isLoggedIn = true;
      loginState.currentUserId = getCurrentUserId();
    } else {
      // 未登录，清除消息列表
      loginState.messageList = [];
      // 清除定时器
      this.clearRefreshTimer();
    }
    
    this.setData(loginState);
  },
  
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/index?from=message'
    });
  },

  fetchConversations(silent = false) {
    // 只有非静默刷新才显示加载状态
    if (!silent) {
      this.setData({ loading: true, error: '' });
    }
    
    return api.getConversations()
      .then(res => {
        if (res.success && res.data) {
          // 检查数据是否变化
          const shouldUpdate = this.shouldUpdateList(res.data, this.data.messageList);
          
          if (shouldUpdate) {
            const formattedMessages = this.formatMessageList(res.data);
            this.setData({
              messageList: formattedMessages,
              lastUpdated: Date.now(),
              loading: false
            });
          } else if (!silent) {
            // 非静默刷新需要更新loading状态
            this.setData({ loading: false });
          }
        } else if (!silent) {
          // 非静默刷新才显示错误
          this.setData({
            error: '获取消息列表失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取消息列表出错：', err);
        
        if (!silent) {
          this.setData({
            error: err.message || '网络错误，请稍后再试',
            loading: false
          });
        }
        
        // 标记网络错误
        if (err.message && err.message.includes('网络')) {
          this.setData({ hasNetworkError: true });
        }
      });
  },
  
  // 格式化消息列表数据
  formatMessageList(data) {
    return data.map(conv => ({
      id: conv.id,
      sender: {
        id: conv.userId,
        name: conv.userName || '未知用户',
        avatar: ensureFullAvatarUrl(conv.userAvatar) || '/images/default-avatar.png'
      },
      lastMessage: conv.lastMessage || '无消息内容',
      lastTime: this.formatTime(conv.lastMessageTime),
      unread: conv.unreadCount,
      displayUnread: conv.unreadCount > 99 ? '99+' : conv.unreadCount
    }));
  },
  
  shouldUpdateList(newData, oldList) {
    // 列表长度不同，需要更新
    if (!oldList.length || oldList.length !== newData.length) return true;
    
    // 检查消息内容或未读数变化
    for (let i = 0; i < newData.length; i++) {
      const newItem = newData[i];
      const oldItem = oldList.find(item => item.id === newItem.id);
      
      if (!oldItem || 
          newItem.lastMessage !== oldItem.lastMessage || 
          newItem.unreadCount !== oldItem.unread) {
        return true;
      }
    }
    
    return false;
  },
  
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const msgTime = new Date(timeStr);
    if (isNaN(msgTime.getTime())) return '';
    
    const now = new Date();
    const today = now.toDateString();
    const msgDate = msgTime.toDateString();
    
    // 今天的消息，只显示时间
    if (today === msgDate) {
      return `${msgTime.getHours().toString().padStart(2, '0')}:${
        msgTime.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // 计算天数差
    const diffDays = Math.floor((now - msgTime) / (24 * 60 * 60 * 1000));
    
    // 近期消息（昨天/前天）
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    
    // 今年的消息，显示月-日
    if (now.getFullYear() === msgTime.getFullYear()) {
      return `${(msgTime.getMonth() + 1).toString().padStart(2, '0')}-${
        msgTime.getDate().toString().padStart(2, '0')}`;
    }
    
    // 更早的消息，显示年-月-日
    return `${msgTime.getFullYear()}-${
      (msgTime.getMonth() + 1).toString().padStart(2, '0')}-${
      msgTime.getDate().toString().padStart(2, '0')}`;
  },
  
  onNavBarHeightChange(e) {
    // 确保高度值为数字
    const height = e.detail.height || 0;
    this.setData({
      navBarHeight: height
    });
  },
  
  onTapMessage(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/message/chat?id=${id}&name=${encodeURIComponent(name || '')}`
    });
  }
}); 