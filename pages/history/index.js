const app = getApp()

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
    this.setData({
      loading: true
    });
    
    // 这里应该是从服务器或本地存储获取浏览历史数据
    // 以下是模拟数据
    setTimeout(() => {
      const historyList = [
        {
          id: '1005',
          title: '蒲种Puchong高档别墅',
          address: '蒲种, IOI Mall 附近',
          price: '5500',
          priceUnit: 'RM/月',
          area: '200',
          areaUnit: '㎡',
          roomType: '5室3厅3卫',
          isFurnished: true,
          tags: ['泳池别墅', '花园', '停车位'],
          imageUrl: '/assets/images/house4.jpg',
          viewTime: '2023-10-18 15:30',
          viewDate: '2023-10-18'
        },
        {
          id: '1006',
          title: '吉隆坡市中心高级公寓',
          address: '吉隆坡市中心, KLCC 附近',
          price: '4200',
          priceUnit: 'RM/月',
          area: '110',
          areaUnit: '㎡',
          roomType: '3室2厅2卫',
          isFurnished: true,
          tags: ['豪华装修', '中央空调', '健身房'],
          imageUrl: '/assets/images/house5.jpg',
          viewTime: '2023-10-18 10:15',
          viewDate: '2023-10-18'
        },
        {
          id: '1003',
          title: 'Cyberjaya现代化公寓',
          address: 'Cyberjaya, Multimedia University 附近',
          price: '2500',
          priceUnit: 'RM/月',
          area: '76',
          areaUnit: '㎡',
          roomType: '3室2厅2卫',
          isFurnished: false,
          tags: ['科技园区', '环境优美', '游泳池'],
          imageUrl: '/assets/images/house3.jpg',
          viewTime: '2023-10-17 12:45',
          viewDate: '2023-10-17'
        },
        {
          id: '1002',
          title: '双威镇大学城学生公寓',
          address: '双威镇, Sunway University 附近',
          price: '1800',
          priceUnit: 'RM/月',
          area: '60',
          areaUnit: '㎡',
          roomType: '1室1厅1卫',
          isFurnished: true,
          tags: ['家电齐全', '学区房', '安保严密'],
          imageUrl: '/assets/images/house2.jpg',
          viewTime: '2023-10-16 09:20',
          viewDate: '2023-10-16'
        },
        {
          id: '1001',
          title: '吉隆坡市中心豪华公寓',
          address: '吉隆坡市中心, KLCC 附近',
          price: '3200',
          priceUnit: 'RM/月',
          area: '85',
          areaUnit: '㎡',
          roomType: '2室1厅1卫',
          isFurnished: true,
          tags: ['地铁附近', '拎包入住', '电梯房'],
          imageUrl: '/assets/images/house1.jpg',
          viewTime: '2023-10-15 18:10',
          viewDate: '2023-10-15'
        }
      ];
      
      // 按日期分组
      const groupedData = this.groupByDate(historyList);
      
      this.setData({
        historyList,
        groupedHistory: groupedData,
        loading: false,
        isEmpty: historyList.length === 0,
        showClearBtn: historyList.length > 0
      });
    }, 500);
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
      title: '马来租房 - 浏览历史',
      path: '/pages/home/index'
    };
  }
}) 