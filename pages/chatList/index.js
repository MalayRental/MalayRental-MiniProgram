const app = getApp()
const { chatService } = require('../../api/service/index');
const userUtils = require('../../utils/userUtils');
const { getImageUrl } = require('../../api/service/imageGetService');

// 聊天时间格式化
function formatChatTime(timeStr) {
  if (!timeStr) return '';
  const now = new Date();
  const date = new Date(timeStr.replace(/-/g, '/'));
  // 兼容iOS
  const nowY = now.getFullYear();
  const nowM = now.getMonth();
  const nowD = now.getDate();
  const dateY = date.getFullYear();
  const dateM = date.getMonth();
  const dateD = date.getDate();
  const pad = n => n < 10 ? '0' + n : n;
  const hm = pad(date.getHours()) + ':' + pad(date.getMinutes());
  // 今天
  if (nowY === dateY && nowM === dateM && nowD === dateD) {
    return `今天 ${hm}`;
  }
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(nowD - 1);
  if (dateY === yesterday.getFullYear() && dateM === yesterday.getMonth() && dateD === yesterday.getDate()) {
    return `昨天 ${hm}`;
  }
  // 前天
  const beforeYesterday = new Date(now);
  beforeYesterday.setDate(nowD - 2);
  if (dateY === beforeYesterday.getFullYear() && dateM === beforeYesterday.getMonth() && dateD === beforeYesterday.getDate()) {
    return `前天 ${hm}`;
  }
  // 今年
  if (nowY === dateY) {
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hm}`;
  }
  // 其他年份
  return `${dateY}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hm}`;
}

Page({
  data: {
    searchValue: '', // 搜索框的值
    filteredChatList: [] // 过滤后的聊天列表
  },
  timer: null, // 定时器句柄

  onLoad: function() {
    this.fetchChatList();
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
    // 启动定时任务
    this.startPolling();
  },

  onHide: function() {
    this.stopPolling();
  },
  onUnload: function() {
    this.stopPolling();
  },

  // 启动定时拉取
  startPolling: function() {
    this.stopPolling(); // 清理旧定时器
    this.fetchChatList(); // 立即拉取一次
    this.timer = setInterval(() => {
      this.fetchChatList();
    }, 2500);
  },

  // 停止定时拉取
  stopPolling: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  // 获取会话列表
  fetchChatList: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userId) {
      this.setData({ filteredChatList: [] });
      return;
    }
    chatService.getChatList(userInfo.userId).then(res => {
      if (res.code === 200 && Array.isArray(res.data)) {
        // 适配字段并处理头像和时间
        const chatList = res.data.map(item => ({
          id: item.chatId,
          avatar: getImageUrl('avatar', item.staffAvatar),
          userName: item.staffName,
          lastMessage:
            item.lastMessageType === 'Image' ? '[图片消息]' :
            item.lastMessageType === 'Card' ? '[卡片消息]' :
            (item.lastMessage ? item.lastMessage : '暂无消息'),
          lastMessageTime: formatChatTime(item.lastMessageTime),
          staffId: item.staffId,
          staffStatus: item.staffStatus,
          lastMessageType: item.lastMessageType
        }));
        this.setData({
          filteredChatList: chatList
        });
      } else {
        this.setData({ filteredChatList: [] });
      }
    }).catch(() => {
      this.setData({ filteredChatList: [] });
    });
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
        filteredChatList: this.data.filteredChatList
      });
      return;
    }
    const filtered = this.data.filteredChatList.filter(item => {
      return item.userName && item.userName.indexOf(keyword) !== -1;
    });
    this.setData({
      filteredChatList: filtered
    });
  },

  // 跳转到聊天页面
  navigateToChat: function(e) {
    const { chatid } = e.currentTarget.dataset;
    const chatItem = this.data.filteredChatList.find(item => item.id === chatid);
    if (chatItem) {
      wx.navigateTo({
        url: `/pages/chatOnline/index?id=${chatid}` +
          `&staffAvatar=${encodeURIComponent(chatItem.avatar)}` +
          `&staffStatus=${chatItem.staffStatus}` +
          `&staffName=${encodeURIComponent(chatItem.userName)}` +
          `&staffId=${chatItem.staffId}`
      });
    }
  },

  onShareAppMessage: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      path: '/pages/home/index',
      imageUrl: ''
    }
  }
}) 