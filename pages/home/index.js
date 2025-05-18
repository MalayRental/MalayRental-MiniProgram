const app = getApp()
const { bannerService, houseAreaService, houseListService } = require('../../api/service/index');
const { getImageUrl } = require('../../api/service/imageGetService');

Page({
  data: {
    searchValue: '', // 搜索框的值
    // 轮播图数据
    banners: [],
    // 筛选器数据
    filters: {
      locations: [],
      selectedLocation: '全部位置',
      rooms: ['不限', '1居', '2居', '3居+'],
      selectedRoom: '不限',
      features: ['双卫生间', 'loft/复式', '不看开间', '开间'],
      selectedFeatures: [],
      orientations: ['东', '西', '南', '北', '南北'],
      selectedOrientations: [],
      areas: ['≤40m²', '40-60m²', '60-80m²', '80-100m²', '100-120m²', '≥120m²'],
      selectedAreas: [],
      prices: ['不限', '≤1000RM', '1000-1500RM', '1500-2000RM', '2000-2500RM', '2500-3000RM', '≥3000RM'],
      selectedPrice: '不限',
      sorts: ['推荐排序', '最新发布', '价格（从低到高）', '价格（从高到低）', '面积（从小到大）', '面积（从大到小）'],
      selectedSort: '推荐排序'
    },
    // 房源列表数据
    houses: [],
    filteredHouses: [] // 过滤后的房源列表
  },

  onLoad: function() {
    // 获取Banner数据
    this.fetchBannerList();
    // 获取区域列表
    this.fetchAreaList();
    // 获取房源列表
    this.fetchHouseList();
  },

  onShow: function() {
    // 设置当前页面底部导航选中状态
    if (typeof this.getTabBar === 'function') {
      const tabBar = this.getTabBar();
      if (tabBar) {
        tabBar.setData({
          selected: 0 // 首页的索引
        });
      }
    }
  },

  // 处理Banner点击事件
  handleBannerTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const banner = this.data.banners[index];
    
    if (banner && banner.link) {
      // 处理特殊导航链接格式 [NAVIGATE][pages/xxx/xxx]
      if (banner.link.startsWith('[NAVIGATE][')) {
        const pagePath = banner.link.substring(11, banner.link.length - 1);
        console.log('导航到页面:', pagePath);
        
        // 跳转到对应页面
        wx.navigateTo({
          url: `/${pagePath}`,
          fail: (err) => {
            console.error('导航失败:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } else if (banner.link !== 'null') {
        // 可以添加其他类型的链接处理，例如外部链接、小程序等
        console.log('其他链接类型:', banner.link);
      }
    }
  },

  // 处理搜索框输入
  handleSearchInput: function(e) {
    const value = e.detail.value;
    this.setData({
      searchValue: value
    });
    this.searchHouses(value);
  },

  // 清空搜索框
  clearSearch: function() {
    this.setData({
      searchValue: ''
    });
    this.searchHouses('');
  },

  // 根据输入搜索房源
  searchHouses: function(keyword) {
    if (!keyword) {
      // 如果关键词为空，显示所有房源，但要考虑筛选条件
      this.filterHouses();
      return;
    }

    // 先基于筛选条件过滤
    let result = this.getFilteredHouses();
    
    // 再根据关键词过滤
    result = result.filter(item => {
      return item.houseName.indexOf(keyword) !== -1;
    });

    this.setData({
      filteredHouses: result
    });
  },

  // 获取根据筛选条件过滤后的房源列表
  getFilteredHouses: function() {
    // 这里应该根据筛选条件过滤房源列表
    // 现在只是简单返回原始数据，实际应用中应该根据筛选条件进行筛选
    return this.data.houses;
  },

  // 筛选器事件处理
  handleFilterChange: function(e) {
    const { type, value } = e.detail;
    
    // 根据筛选类型更新对应的数据
    if (type === 'location') {
      this.setData({
        'filters.selectedLocation': value
      });
    } else if (type === 'room') {
      this.setData({
        'filters.selectedRoom': value
      });
    } else if (type === 'price') {
      this.setData({
        'filters.selectedPrice': value
      });
    } else if (type === 'sort') {
      this.setData({
        'filters.selectedSort': value
      });
    }
    
    // 更新过滤后的房源列表
    this.filterHouses();
  },

  // 处理位置选择
  handleLocationChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedLocation': this.data.filters.locations[index]
    });
    // 根据选择更新房源列表
    this.filterHouses();
  },

  // 处理户型选择
  handleRoomChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedRoom': this.data.filters.rooms[index]
    });
    // 根据选择更新房源列表
    this.filterHouses();
  },

  // 处理价格选择
  handlePriceChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedPrice': this.data.filters.prices[index]
    });
    // 根据选择更新房源列表
    this.filterHouses();
  },

  // 处理排序选择
  handleSortChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedSort': this.data.filters.sorts[index]
    });
    // 根据选择更新房源列表
    this.filterHouses();
  },

  // 过滤房源列表
  filterHouses: function() {
    // 获取基于筛选条件过滤后的房源
    const filteredHouses = this.getFilteredHouses();
    
    // 如果有搜索关键词，还需要基于关键词进一步过滤
    if (this.data.searchValue) {
      const keyword = this.data.searchValue;
      const result = filteredHouses.filter(item => {
        return item.houseName.indexOf(keyword) !== -1;
      });
      
      this.setData({
        filteredHouses: result
      });
    } else {
      this.setData({
        filteredHouses: filteredHouses
      });
    }
    
    console.log('筛选条件已更新');
    console.log('位置:', this.data.filters.selectedLocation);
    console.log('户型:', this.data.filters.selectedRoom);
    console.log('价格:', this.data.filters.selectedPrice);
    console.log('排序:', this.data.filters.selectedSort);
    console.log('搜索关键词:', this.data.searchValue);
  },

  // 点击房源跳转到详情页
  navigateToDetail: function(e) {
    const { houseid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${houseid}`
    });
  },

  // 获取Banner列表
  fetchBannerList: function() {
    wx.showLoading({
      title: '加载中...',
    });
    
    bannerService.getBannerList()
      .then(banners => {
        // 处理banner图片地址
        const bannersWithUrl = banners.map(item => ({
          ...item,
          image: getImageUrl('banner', item.image)
        }));
        this.setData({
          banners: bannersWithUrl
        });
        wx.hideLoading();
      })
      .catch(error => {
        console.error('获取Banner失败:', error);
        wx.hideLoading();
        wx.showToast({
          title: '获取轮播图失败',
          icon: 'none'
        });
      });
  },

  // 获取区域列表
  fetchAreaList: function() {
    houseAreaService.getAreaList()
      .then(areaList => {
        // 只取区域名，首项为"全部位置"
        const locations = ['全部位置', ...areaList.map(item => item.name)];
        this.setData({
          'filters.locations': locations,
          'filters.selectedLocation': '全部位置'
        });
      })
      .catch(error => {
        wx.showToast({
          title: '获取区域失败',
          icon: 'none'
        });
      });
  },

  // 获取房源列表
  fetchHouseList: function() {
    wx.showLoading({ title: '加载中...' });
    houseListService.getHouseList()
      .then(houseList => {
        // 处理房源封面图片地址
        const housesWithUrl = houseList.map(item => ({
          ...item,
          coverImage: getImageUrl('houseCover', item.coverImage)
        }));
        this.setData({
          houses: housesWithUrl,
          filteredHouses: housesWithUrl
        });
        wx.hideLoading();
      })
      .catch(error => {
        wx.hideLoading();
        wx.showToast({
          title: '获取房源失败',
          icon: 'none'
        });
      });
  },
}) 