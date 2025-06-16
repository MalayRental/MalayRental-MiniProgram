const app = getApp()
const { getHistoryList } = require('../../api/service/historyService');
const { getUserInfo, isLoggedIn, navigateToLogin } = require('../../utils/userUtils');

Page({
  data: {
    historyList: [], // 浏览历史列表
    loading: true,   // 加载状态
    isEmpty: false,  // 是否为空列表
    showClearBtn: false, // 是否显示清空按钮
    groupedHistory: [] // 按日期分组的历史记录
  },

  onLoad: function() {
    // 页面加载时获取浏览历史数据
    this.getHistoryList();
  },
  
  onShow: function() {
    // 每次显示页面时刷新数据
    this.getHistoryList();
  },
  
  // 获取浏览历史列表
  getHistoryList: function() {
    this.setData({ loading: true });
    if (!isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => { navigateToLogin(); }, 800);
      this.setData({ loading: false, isEmpty: true, historyList: [], groupedHistory: [], showClearBtn: false });
      return;
    }
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.userId) {
      wx.showToast({ title: '用户信息异常', icon: 'none' });
      this.setData({ loading: false, isEmpty: true, historyList: [], groupedHistory: [], showClearBtn: false });
      return;
    }
    getHistoryList(userInfo.userId)
      .then(historyList => {
        // 按日期分组
        const groupedData = this.groupByDate(historyList.map(item => {
          // 兼容后端无viewDate字段，使用createTime日期
          const date = item.createTime ? item.createTime.split('T')[0] : '';
          return { ...item, viewDate: date, viewTime: item.createTime };
        }));
        this.setData({
          historyList,
          groupedHistory: groupedData,
          loading: false,
          isEmpty: historyList.length === 0,
          showClearBtn: historyList.length > 0
        });
      })
      .catch(() => {
        this.setData({
          historyList: [],
          groupedHistory: [],
          loading: false,
          isEmpty: true,
          showClearBtn: false
        });
        wx.showToast({ title: '获取历史浏览失败', icon: 'none' });
      });
  },
  
  // 按日期分组历史记录
  groupByDate: function(list) {
    const groups = {};
    
    // 对列表进行分组
    list.forEach(item => {
      if (!groups[item.viewDate]) {
        groups[item.viewDate] = [];
      }
      groups[item.viewDate].push(item);
    });
    
    // 转换为数组格式，方便在视图中使用
    const result = [];
    for (const date in groups) {
      result.push({
        date: date,
        displayDate: this.formatDate(date), // 格式化日期显示
        items: groups[date]
      });
    }
    
    // 按日期降序排序（最新的在前）
    result.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    return result;
  },
  
  // 格式化日期显示
  formatDate: function(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 日期比较，只比较年月日
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return '今天';
    } else if (isYesterday) {
      return '昨天';
    } else {
      // 其他日期显示为 MM月DD日
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
  },
  
  // 清除单条浏览记录
  removeHistory: function(e) {
    const id = e.currentTarget.dataset.id;
    
    // 这里应该是调用接口删除浏览记录
    // 以下是模拟操作
    const historyList = this.data.historyList.filter(item => item.id !== id);
    
    // 重新按日期分组
    const groupedData = this.groupByDate(historyList);
    
    this.setData({
      historyList,
      groupedHistory: groupedData,
      isEmpty: historyList.length === 0,
      showClearBtn: historyList.length > 0
    });
    
    wx.showToast({
      title: '已删除',
      icon: 'success'
    });
  },
  
  // 清空所有浏览记录
  clearAllHistory: function() {
    wx.showModal({
      title: '清空浏览记录',
      content: '确定要清空所有浏览记录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 这里应该是调用接口清空浏览记录
          // 以下是模拟操作
          this.setData({
            historyList: [],
            groupedHistory: [],
            isEmpty: true,
            showClearBtn: false
          });
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 前往房源详情
  goToDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${id}`
    });
  },
  
  // 分享
  onShareAppMessage: function() {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      path: '/pages/home/index',
      imageUrl: ''
    };
  },
  
  onShareTimeline: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      query: '',
      imageUrl: ''
    }
  }
}) 