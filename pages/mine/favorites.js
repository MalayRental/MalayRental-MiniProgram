const { api } = require('../../utils/request');
const { adaptHouseList } = require('../../utils/dataAdapter');

Page({
  data: {
    allHouses: [], // 所有房源数据
    favorites: [], // 用户收藏的房源
    favoritesIds: [], // 用户收藏的房源ID列表
    navBarHeight: 0,
    loading: true,
    error: ''
  },
  
  onLoad() {
    this.fetchData();
  },
  
  // 页面显示时刷新数据
  onShow() {
    this.fetchData();
  },
  
  // 获取所有需要的数据
  fetchData() {
    // 显示加载状态
    this.setData({
      loading: true,
      error: ''
    });
    
    // 先获取用户收藏ID列表
    this.fetchFavoritesIds()
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
  
  // 获取用户收藏的房源ID列表
  fetchFavoritesIds() {
    return new Promise((resolve, reject) => {
      // 调用API获取收藏列表
      api.getFavorites()
        .then(res => {
          if (res.success && res.data) {
            // 提取收藏的房源ID
            const favoritesIds = res.data.map(item => item.id);
            
            this.setData({
              favoritesIds
            });
            
            resolve();
          } else {
            this.setData({
              error: '获取收藏列表失败',
              loading: false
            });
            reject(new Error('获取收藏列表失败'));
          }
        })
        .catch(err => {
          console.error('获取收藏列表出错:', err);
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
            
            // 根据收藏ID列表过滤出收藏的房源
            const favorites = adaptedHouses.filter(house => 
              this.data.favoritesIds.includes(house.id)
            );
            
            this.setData({
              allHouses: adaptedHouses,
              favorites: favorites,
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
  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },
  
  // 点击房源进入详情页
  onHouseClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${id}`
    });
  }
}); 