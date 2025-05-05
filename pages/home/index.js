// const { houseList } = require('../../utils/mock/houses');
// 导入API请求模块和数据适配器
const { api } = require('../../utils/request');
const { adaptHouseList, adaptAreaOptions } = require('../../utils/dataAdapter');

Page({
  data: {
    banners: [
      '/images/lbt/Bing_0028.jpeg',
      '/images/lbt/Bing_0031.jpeg',
      '/images/lbt/Bing_0036.png',
      '/images/lbt/Bing_0039.jpeg',
      '/images/lbt/Bing_0038.jpeg'
    ],
    houses: [],
    searchValue: '',
    activeTab: 0,
    navBarHeight: 0, // 导航栏高度
    filterData: {
      area: '全部区域',
      sort: '默认排序',
      price: '全部价格',
      room: '全部户型'
    },
    areaOptions: ['全部区域', '吉隆坡', '槟城', '新山', '兰卡威', '怡保'],
    sortOptions: ['默认排序', '价格从低到高', '价格从高到低', '面积从大到小', '面积从小到大'],
    priceOptions: ['全部价格', '1000以下', '1000-2000', '2000-3000', '3000以上'],
    roomOptions: ['全部户型', '1房', '2房', '3房', '4房及以上'],
    showFilter: false,
    currentFilterType: '',
    loading: false, // 加载状态
    error: '' // 错误信息
  },

  onLoad() {
    // 轮播图图片已在data中初始化为lbt下所有图片
    this.fetchHouses();
    this.fetchAreas();
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  },

  // 从API获取房源数据
  fetchHouses() {
    this.setData({ loading: true, error: '' });
    
    api.getHouses()
      .then(res => {
        if (res.success && res.data) {
          // 使用适配器处理数据
          const adaptedHouses = adaptHouseList(res.data);
          this.setData({ 
            houses: adaptedHouses,
            loading: false
          });
        } else {
          this.setData({ 
            error: '获取房源失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取房源出错：', err);
        this.setData({ 
          error: err.message || '网络错误，请稍后再试',
          loading: false
        });
      });
  },
  
  // 从API获取区域数据
  fetchAreas() {
    api.getAllAreas()
      .then(res => {
        if (res.success && res.data) {
          // 使用适配器处理区域数据
          const areaOptions = adaptAreaOptions(res.data);
          this.setData({ areaOptions });
        }
      })
      .catch(err => {
        console.error('获取区域出错：', err);
      });
  },

  // 接收导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },

  onSearch(e) {
    const searchValue = e.detail.value;
    this.setData({ searchValue });
    
    // 搜索实现
    if (searchValue) {
      this.fetchAndFilterHouses(searchValue);
    } else {
      this.fetchHouses();
    }
  },

  // 切换筛选类型
  onTabChange(e) {
    const activeTab = parseInt(e.currentTarget.dataset.value);
    this.setData({
      activeTab,
      showFilter: true,
      currentFilterType: ['area', 'sort', 'price', 'room'][activeTab]
    });
  },

  // 阻止事件冒泡
  preventBubble() {
    return;
  },

  // 选择筛选选项
  onFilterItemClick(e) {
    const { type, value } = e.currentTarget.dataset;
    const filterData = { ...this.data.filterData };
    filterData[type] = value;
    
    this.setData({
      filterData,
      showFilter: false
    });
    
    this.applyFilters();
  },

  // 关闭筛选面板
  closeFilter() {
    this.setData({
      showFilter: false
    });
  },
  
  // 根据搜索词获取并过滤房源
  fetchAndFilterHouses(searchValue) {
    this.setData({ loading: true, error: '' });
    
    api.getHouses()
      .then(res => {
        if (res.success && res.data) {
          // 使用适配器处理数据
          let adaptedHouses = adaptHouseList(res.data);
          
          // 本地搜索过滤
          if (searchValue) {
            adaptedHouses = adaptedHouses.filter(house => 
              (house.title && house.title.includes(searchValue)) || 
              (house.address && house.address.includes(searchValue))
            );
          }
          
          this.setData({ 
            houses: adaptedHouses,
            loading: false
          });
        } else {
          this.setData({ 
            error: '获取房源失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取房源出错：', err);
        this.setData({ 
          error: err.message || '网络错误，请稍后再试',
          loading: false
        });
      });
  },

  // 应用所有筛选条件
  applyFilters() {
    this.setData({ loading: true, error: '' });
    
    api.getHouses()
      .then(res => {
        if (res.success && res.data) {
          // 使用适配器处理数据
          let adaptedHouses = adaptHouseList(res.data);
          const { area, sort, price, room } = this.data.filterData;
          
          // 本地过滤 - 区域
          if (area !== '全部区域') {
            adaptedHouses = adaptedHouses.filter(house => 
              house.area && house.area === area
            );
          }
          
          // 本地过滤 - 户型
          if (room !== '全部户型') {
            const roomNum = parseInt(room);
            if (room === '4房及以上') {
              adaptedHouses = adaptedHouses.filter(house => house.room && house.room >= 4);
            } else {
              adaptedHouses = adaptedHouses.filter(house => house.room && house.room === roomNum);
            }
          }
          
          // 本地过滤 - 价格
          if (price !== '全部价格') {
            if (price === '1000以下') {
              adaptedHouses = adaptedHouses.filter(house => house.price && house.price < 1000);
            } else if (price === '1000-2000') {
              adaptedHouses = adaptedHouses.filter(house => house.price && house.price >= 1000 && house.price <= 2000);
            } else if (price === '2000-3000') {
              adaptedHouses = adaptedHouses.filter(house => house.price && house.price >= 2000 && house.price <= 3000);
            } else if (price === '3000以上') {
              adaptedHouses = adaptedHouses.filter(house => house.price && house.price > 3000);
            }
          }
          
          // 本地排序
          if (sort === '价格从低到高') {
            adaptedHouses.sort((a, b) => (a.price || 0) - (b.price || 0));
          } else if (sort === '价格从高到低') {
            adaptedHouses.sort((a, b) => (b.price || 0) - (a.price || 0));
          } else if (sort === '面积从大到小') {
            adaptedHouses.sort((a, b) => (b.area || 0) - (a.area || 0));
          } else if (sort === '面积从小到大') {
            adaptedHouses.sort((a, b) => (a.area || 0) - (b.area || 0));
          }
          
          this.setData({ 
            houses: adaptedHouses,
            loading: false
          });
        } else {
          this.setData({ 
            error: '获取房源失败',
            loading: false
          });
        }
      })
      .catch(err => {
        console.error('获取房源出错：', err);
        this.setData({ 
          error: err.message || '网络错误，请稍后再试',
          loading: false
        });
      });
  },

  onHouseClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${id}`
    });
  }
}); 