const app = getApp()
const { getFavoriteList } = require('../../api/service/favoriteService');
const { getUserInfo, isLoggedIn, navigateToLogin } = require('../../utils/userUtils');

Page({
  data: {
    favoriteList: [], // 收藏列表
    loading: true,    // 加载状态
    isEmpty: false    // 是否为空列表
  },

  onLoad: function() {
    // 页面加载时获取收藏数据
    this.getFavoriteList();
  },
  
  onShow: function() {
    // 每次显示页面时刷新数据
    this.getFavoriteList();
  },
  
  // 获取收藏列表
  getFavoriteList: function() {
    if (!isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => { navigateToLogin(); }, 800);
      this.setData({ loading: false, isEmpty: true, favoriteList: [] });
      return;
    }
    this.setData({ loading: true });
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.userId) {
      wx.showToast({ title: '用户信息异常', icon: 'none' });
      this.setData({ loading: false, isEmpty: true, favoriteList: [] });
      return;
    }
    getFavoriteList(userInfo.userId)
      .then(list => {
        // 适配后端数据结构，整理前端展示字段
        const favoriteList = (list || []).map(item => {
          return {
            id: item.houseId,
            title: item.houseName,
            address: item.area,
            price: item.price,
            priceUnit: 'RM/月',
            area: item.proportion,
            areaUnit: '㎡',
            orientation: item.orientation,
            imageUrl: item.coverImage,
            favoriteTime: item.createTime
          };
        });
        this.setData({
          favoriteList,
          loading: false,
          isEmpty: favoriteList.length === 0
        });
      })
      .catch(() => {
        this.setData({
          favoriteList: [],
          loading: false,
          isEmpty: true
        });
        wx.showToast({ title: '获取收藏失败', icon: 'none' });
      });
  },
  
  // 移除收藏
  removeFavorite: function(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏该房源吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 这里应该是调用接口取消收藏
          // 以下是模拟操作
          const favoriteList = this.data.favoriteList.filter(item => item.id !== id);
          
          this.setData({
            favoriteList,
            isEmpty: favoriteList.length === 0
          });
          
          wx.showToast({
            title: '已取消收藏',
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
  }
}) 