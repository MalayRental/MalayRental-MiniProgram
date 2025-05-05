const { api } = require('../../utils/request');
const { adaptHouseList, formatHistoryTime } = require('../../utils/dataAdapter');

Page({
  data: {
    allHouses: [], // 所有房源数据
    history: [], // 用户浏览历史的房源
    historyRecords: [], // 原始浏览历史记录
    groupedHistory: [], // 按天分组的历史记录
    navBarHeight: 0,
    loading: true,
    error: ''
  },
  
  onLoad() {
    // 页面加载时获取历史记录
    this.fetchData();
  },
  
  onShow() {
    // 每次页面显示时刷新数据
    this.fetchData();
  },
  
  // 获取所有需要的数据
  fetchData() {
    // 显示加载状态
    this.setData({
      loading: true,
      error: ''
    });
    
    // 先获取用户浏览历史记录
    this.fetchHistoryRecords()
      .then(() => {
        // 再获取所有房源数据
        return this.fetchAllHouses();
      })
      .catch(err => {
        console.error('获取数据出错:', err);
        this.setData({
          error: err.message || '网络错误，请稍后再试',
          loading: false
        });
      });
  },
  
  // 获取用户浏览历史记录
  fetchHistoryRecords() {
    return new Promise((resolve, reject) => {
      // 调用API获取浏览历史
      api.getHistory()
        .then(res => {
          if (res.success && res.data) {
            // 存储原始浏览历史记录
            this.setData({
              historyRecords: res.data
            });
            
            resolve();
          } else {
            this.setData({
              error: '获取浏览历史失败',
              loading: false
            });
            reject(new Error('获取浏览历史失败'));
          }
        })
        .catch(err => {
          console.error('获取浏览历史出错:', err);
          this.setData({
            error: err.message || '网络错误，请稍后再试',
            loading: false
          });
          reject(err);
        });
    });
  },
  
  // 获取所有房源数据
  fetchAllHouses() {
    return new Promise((resolve, reject) => {
      api.getHouses()
        .then(res => {
          if (res.success && res.data) {
            // 使用适配器处理数据
            const adaptedHouses = adaptHouseList(res.data);
            
            // 创建房源ID到房源的映射
            const houseMap = {};
            adaptedHouses.forEach(house => {
              houseMap[house.id] = house;
            });
            
            // 根据浏览历史记录创建完整的历史记录数组（不去重）
            const historyList = this.data.historyRecords.map(record => {
              const house = houseMap[record.id];
              if (!house) return null; // 忽略不存在的房源
              
              // 为每个记录添加浏览时间
              return {
                ...house,
                history_time: record.history_time || '',
                historyTime: record.history_time ? formatHistoryTime(new Date(record.history_time)) : ''
              };
            }).filter(item => item !== null); // 过滤掉不存在的房源
            
            // 按浏览时间从新到旧排序
            historyList.sort((a, b) => {
              const timeA = new Date(a.history_time).getTime();
              const timeB = new Date(b.history_time).getTime();
              return timeB - timeA; // 降序排列，最新的在前面
            });
            
            // 将历史记录按天分组
            const groupedHistory = this.groupHistoryByDay(historyList);
            
            this.setData({
              allHouses: adaptedHouses,
              history: historyList,
              groupedHistory: groupedHistory,
              loading: false
            });
            
            resolve();
          } else {
            this.setData({
              error: '获取房源失败',
              loading: false
            });
            reject(new Error('获取房源失败'));
          }
        })
        .catch(err => {
          console.error('获取房源出错:', err);
          this.setData({
            error: err.message || '网络错误，请稍后再试',
            loading: false
          });
          reject(err);
        });
    });
  },
  
  // 将历史记录按天分组
  groupHistoryByDay(historyList) {
    const groups = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const twoDaysAgo = yesterday - 24 * 60 * 60 * 1000;
    
    // 临时存储已分组的日期
    const groupedDates = {};
    
    historyList.forEach(house => {
      if (!house.history_time) return;
      
      const date = new Date(house.history_time);
      const time = date.getTime();
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const dayStart = new Date(year, month, day).getTime();
      
      // 确定日期标签
      let dateLabel = '';
      if (dayStart === today) {
        dateLabel = '今天';
      } else if (dayStart === yesterday) {
        dateLabel = '昨天';
      } else if (dayStart === twoDaysAgo) {
        dateLabel = '前天';
      } else {
        // 格式化日期，例如：2023年4月5日
        dateLabel = `${year}年${month + 1}月${day}日`;
      }
      
      // 如果该日期组不存在，创建新组
      if (!groupedDates[dayStart]) {
        const newGroup = {
          date: dayStart,
          dateLabel: dateLabel,
          items: []
        };
        groups.push(newGroup);
        groupedDates[dayStart] = newGroup;
      }
      
      // 将房源添加到对应日期组
      groupedDates[dayStart].items.push(house);
    });
    
    // 确保按日期从新到旧排序
    groups.sort((a, b) => b.date - a.date);
    
    return groups;
  },
  
  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },
  
  // 点击房源跳转到详情页
  onHouseClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${id}`
    });
  },
  
  // 删除单条浏览记录（功能保留但UI中已移除）
  deleteHistoryItem(e) {
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '删除记录',
      content: '确定要删除此条浏览记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          api.removeHistoryItem(id)
            .then(res => {
              if (res.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                // 重新获取列表
                this.fetchData();
              } else {
                wx.showToast({
                  title: res.message || '删除失败',
                  icon: 'none'
                });
                this.setData({ loading: false });
              }
            })
            .catch(err => {
              console.error('删除浏览记录失败:', err);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
              this.setData({ loading: false });
            });
        }
      }
    });
  },
  
  // 清空所有浏览历史（功能保留但UI中已移除）
  clearAllHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定要清空所有浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true });
          
          api.clearHistory()
            .then(res => {
              if (res.success) {
                wx.showToast({
                  title: '已清空历史',
                  icon: 'success'
                });
                this.setData({
                  history: [],
                  groupedHistory: [],
                  loading: false
                });
              } else {
                wx.showToast({
                  title: res.message || '清空失败',
                  icon: 'none'
                });
                this.setData({ loading: false });
              }
            })
            .catch(err => {
              console.error('清空浏览历史失败:', err);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
              this.setData({ loading: false });
            });
        }
      }
    });
  },
  
  // 重写物理返回按钮行为
  onBackPress() {
    wx.switchTab({
      url: '/pages/mine/index'
    });
    return true; // 阻止默认返回行为
  }
}); 