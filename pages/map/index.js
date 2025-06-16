// map.js
const { getHouseList } = require('../../api/service/houseListService.js');
const { houseAreaService } = require('../../api/service/index');

Page({
  data: {
    latitude: 2.8170, // 马来西亚Nilai中心
    longitude: 101.7881,
    markers: [],
    showHouseInfo: false,
    currentHouse: null,
    scale: 14,
    cityName: 'Nilai', // 默认城市名称
    // 默认房源图片
    loadingHouses: true,
    loadError: false,
    // 新增筛选器数据
    filters: {
      locations: ['全部位置', 'Nilai', 'Seremban', 'Kajang', 'Sepang', 'Cyberjaya', 'Putrajaya', 'Bangi'],
      selectedLocation: '全部位置',
      rooms: ['不限', '1居', '2居', '3居+'],
      selectedRoom: '不限',
      prices: ['不限', '≤1000RM', '1000-1500RM', '1500-2000RM', '2000-2500RM', '2500-3000RM', '≥3000RM'],
      selectedPrice: '不限'
    },
    filteredHouses: [], // 筛选后的房源
  },

  onLoad(options) {
    // 从页面参数获取城市信息
    if (options.latitude && options.longitude) {
      const latitude = parseFloat(options.latitude);
      const longitude = parseFloat(options.longitude);
      const cityName = options.cityName || 'Nilai';

      this.setData({
        latitude,
        longitude,
        cityName
      });
    }
    // 不再自动获取用户位置

    // 确保初始区域列表中没有null值
    this.cleanInitialLocations();

    // 获取位置区域列表
    this.fetchAreaList();
    
    // 优先从全局变量或本地缓存获取首页房源数据
    let houseList = getApp().globalData.houseList || wx.getStorageSync('houseList') || [];
    console.log('地图页-原始houseList:', houseList);
    houseList = houseList.filter(item => item.status === 'Normal');
    console.log('地图页-过滤status后houseList:', houseList);
    // 处理 lat_lng 字段为经纬度
    const processedHouses = houseList.map(item => {
      console.log('房源id:', item.id, 'lat_lng:', item.lat_lng);
      let latitude = null, longitude = null;
      if (item.lat_lng) {
        const [x, y] = item.lat_lng.replace(/[A-Za-z]/g, '').split(',');
        latitude = parseFloat(x);
        longitude = parseFloat(y);
        console.log('解析lat_lng:', item.lat_lng, '=>', latitude, longitude);
      }
      // id只保留数字部分且为number
      let markerId = item.houseId;
      if (typeof markerId === 'string') {
        const match = markerId.match(/\d+/);
        markerId = match ? Number(match[0]) : null;
      }
      return {
        ...item,
        id: markerId,
        latitude,
        longitude,
        imgUrl: item.coverImage
      };
    });
    console.log('地图页-处理后房源数据:', processedHouses);
    this.processHouseData(processedHouses);
  },

  // 清理初始区域列表
  cleanInitialLocations: function() {
    const cleanLocations = this.data.filters.locations.filter(location => 
      location && location !== 'null' && String(location).trim() !== ''
    );

    if (cleanLocations.length > 0 && !cleanLocations.includes('全部位置')) {
      cleanLocations.unshift('全部位置');
    }

    this.setData({
      'filters.locations': cleanLocations
    });
  },

  // 获取区域列表
  fetchAreaList: function() {
    houseAreaService.getAreaList()
      .then(areas => {
        if (Array.isArray(areas) && areas.length > 0) {
          // 获取API返回的区域名称，过滤掉null、undefined和空字符串
          const apiAreaNames = areas
            .filter(area => area && area.areaName) // 确保area对象存在且有areaName属性
            .map(area => String(area.areaName).trim()) // 转为字符串并去除前后空格
            .filter(name => name && name !== 'null' && name !== 'undefined' && name !== ''); // 过滤无效值
          
          // 合并预设区域和API返回的区域，去重
          const currentLocations = this.data.filters.locations;
          const mergedLocations = ['全部位置'];
          
          // 添加API返回的区域（如果不在预设中）
          apiAreaNames.forEach(areaName => {
            if (!mergedLocations.includes(areaName) && areaName !== '全部位置') {
              mergedLocations.push(areaName);
            }
          });
          
          // 添加预设区域（除了"全部位置"）
          currentLocations.forEach(location => {
            if (location && location !== 'null' && location !== '全部位置' && !mergedLocations.includes(location)) {
              mergedLocations.push(location);
            }
          });
          
          console.log('更新位置列表:', mergedLocations);
          
          // 更新筛选器位置列表
          this.setData({
            'filters.locations': mergedLocations
          });
        }
      })
      .catch(error => {
        console.error('获取区域列表失败:', error);
      });
  },

  // 处理位置选择
  handleLocationChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedLocation': this.data.filters.locations[index]
    });
    // 根据选择更新地图标记
    this.filterMarkers();
  },

  // 处理户型选择
  handleRoomChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedRoom': this.data.filters.rooms[index]
    });
    // 根据选择更新地图标记
    this.filterMarkers();
  },

  // 处理价格选择
  handlePriceChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'filters.selectedPrice': this.data.filters.prices[index]
    });
    // 根据选择更新地图标记
    this.filterMarkers();
  },

  // 根据筛选条件过滤地图标记
  filterMarkers: function() {
    if (!this.data.processedHouses || this.data.processedHouses.length === 0) {
      return;
    }
    
    // 获取筛选条件
    const location = this.data.filters.selectedLocation;
    const room = this.data.filters.selectedRoom;
    const price = this.data.filters.selectedPrice;
    
    // 筛选房源
    let filteredHouses = [...this.data.processedHouses];
    
    // 按位置筛选
    if (location !== '全部位置') {
      filteredHouses = filteredHouses.filter(house => 
        house.area === location || house.address?.includes(location)
      );
    }
    
    // 按户型筛选
    if (room !== '不限') {
      filteredHouses = filteredHouses.filter(house => {
        if (room === '1居') return house.proportion?.includes('1') || house.rooms === 1;
        if (room === '2居') return house.proportion?.includes('2') || house.rooms === 2;
        if (room === '3居+') return house.proportion?.includes('3') || house.rooms >= 3;
        return true;
      });
    }
    
    // 按价格筛选
    if (price !== '不限') {
      filteredHouses = filteredHouses.filter(house => {
        const priceNum = parseFloat(house.price);
        if (price === '≤1000RM') {
          return priceNum <= 1000;
        } else if (price === '1000-1500RM') {
          return priceNum > 1000 && priceNum <= 1500;
        } else if (price === '1500-2000RM') {
          return priceNum > 1500 && priceNum <= 2000;
        } else if (price === '2000-2500RM') {
          return priceNum > 2000 && priceNum <= 2500;
        } else if (price === '2500-3000RM') {
          return priceNum > 2500 && priceNum <= 3000;
        } else if (price === '≥3000RM') {
          return priceNum > 3000;
        }
        return true;
      });
    }
    
    // 更新过滤后的房源列表
    this.setData({
      filteredHouses
    });
    
    // 更新地图标记
    this.updateMapMarkers(filteredHouses);
  },
  
  // 更新地图标记
  updateMapMarkers: function(houses) {
    const markers = houses.map(house => {
      // 提取houseId中的数字部分作为id
      let markerId = house.id;
      if (typeof markerId === 'string') {
        const match = markerId.match(/\d+/);
        markerId = match ? Number(match[0]) : null;
      }
      // 截断标题，汉字算1个字，字母和符号算0.5个字，最多10个字，超出加省略号
      let title = house.title || house.houseName || '';
      let len = 0, cutIdx = 0;
      for (let i = 0; i < title.length; i++) {
        const char = title[i];
        if (/[\x00-\x7f]/.test(char)) {
          len += 0.5; // 英文、符号
        } else {
          len += 1; // 汉字
        }
        if (len > 10) {
          break;
        }
        cutIdx = i + 1;
      }
      if (cutIdx < title.length) {
        title = title.slice(0, cutIdx) + '...';
      }
      return {
        id: markerId,
        latitude: house.latitude,
        longitude: house.longitude,
        width: 40,
        height: 40,
        iconPath: '/assets/icons/icon-locate.png',
        callout: {
          content: `${title}\nRM${house.price}/月`,
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 5,
          bgColor: '#1aad19',
          padding: 8,
          display: 'ALWAYS', // 始终显示
          textAlign: 'center'
        },
        // 点击区域放大
        clickable: true,
        anchor: {
          x: 0.5,
          y: 1.0
        }
      };
    });
    
    this.setData({
      markers
    });
  },

  // 加载房源标记
  loadHouseMarkers() {
    this.setData({ loadingHouses: true, loadError: false });

    // 尝试从API获取房源数据
    getHouseList()
      .then(apiHouses => {
        // 处理API返回的房源数据
        // 注意：API中可能没有经纬度信息，这里我们先使用本地数据
        this.processHouseData(apiHouses);
      })
      .catch(error => {
        console.error('从API获取房源失败，使用本地数据:', error);
        // 使用本地数据作为备选
        this.processHouseData(apiHouses);
      });
  },

  // 处理房源数据
  processHouseData(houseData) {
    console.log('地图页-加载标记，房源数量:', houseData.length);
    
    // 处理房源数据，确保图片路径正确
    const processedHouses = houseData.map(house => {
      return {
        ...house,
        imgUrl: house.coverImage // 用真实的封面图片
      };
    });
    
    // 使用上传的图标
    const markers = processedHouses.map(house => {
      // 提取houseId中的数字部分作为id
      let markerId = house.id;
      if (typeof markerId === 'string') {
        const match = markerId.match(/\d+/);
        markerId = match ? Number(match[0]) : null;
      }
      // 截断标题，汉字算1个字，字母和符号算0.5个字，最多10个字，超出加省略号
      let title = house.title || house.houseName || '';
      let len = 0, cutIdx = 0;
      for (let i = 0; i < title.length; i++) {
        const char = title[i];
        if (/[\x00-\x7f]/.test(char)) {
          len += 0.5; // 英文、符号
        } else {
          len += 1; // 汉字
        }
        if (len > 10) {
          break;
        }
        cutIdx = i + 1;
      }
      if (cutIdx < title.length) {
        title = title.slice(0, cutIdx) + '...';
      }
      return {
        id: markerId,
        latitude: house.latitude,
        longitude: house.longitude,
        width: 40,
        height: 40,
        iconPath: '/assets/icons/icon-locate.png',
        callout: {
          content: `${title}\nRM${house.price}/月`,
          color: '#ffffff',
          fontSize: 14,
          borderRadius: 5,
          bgColor: '#1aad19',
          padding: 8,
          display: 'ALWAYS', // 始终显示
          textAlign: 'center'
        },
        // 点击区域放大
        clickable: true,
        anchor: {
          x: 0.5,
          y: 1.0
        }
      };
    });
    console.log('地图页-生成markers:', markers);
    
    this.setData({
      markers,
      processedHouses,
      filteredHouses: processedHouses,
      loadingHouses: false
    });
  },

  // 点击标记点时触发
  onMarkerTap(e) {
    console.log('点击了标记:', e);
    const markerId = e.markerId;
    // 通过markerId找到对应的house对象
    const house = this.data.processedHouses.find(h => {
      let idNum = h.id;
      if (typeof idNum === 'string') {
        const match = idNum.match(/\d+/);
        idNum = match ? Number(match[0]) : null;
      }
      return idNum === markerId;
    });
    if (house) {
      // 获取房源详情，传递house.houseId
      const { getHouseDetail } = require('../../api/service/houseDetailService');
      getHouseDetail(house.houseId).then(detail => {
        // 只用首页缓存的coverImage
        // 展示详细信息
        this.setData({
          showHouseInfo: false,
          currentHouse: null
        }, () => {
          setTimeout(() => {
            this.setData({
              currentHouse: {
                ...detail,
                coverImage: house.coverImage // 只用首页缓存图片
              },
              showHouseInfo: true
            });
          }, 50);
        });
      }).catch(() => {
        wx.showToast({ title: '获取房源详情失败', icon: 'none' });
      });
    } else {
      wx.showToast({ title: '未找到对应房源', icon: 'none' });
    }
  },

  // 阻止事件冒泡
  stopEvent() {
    // 不做任何操作，只阻止事件冒泡
  },

  // 点击地图区域，关闭房源信息
  onTapMap() {
    console.log('点击地图');
    if (this.data.showHouseInfo) {
      this.setData({
        showHouseInfo: false
      });
    }
  },

  // 点击查看详情按钮
  viewHouseDetail() {
    const house = this.data.currentHouse;
    if (house && house.houseId) {
      wx.navigateTo({
        url: `/pages/houseDetail/index?id=${house.houseId}`
      });
    } else {
      wx.showToast({ title: '未找到房源ID', icon: 'none' });
    }
  },

  // 关闭房源信息面板
  closeHouseInfo() {
    this.setData({
      showHouseInfo: false
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      path: '/pages/home/index',
      imageUrl: ''
    }
  },
    onShareTimeline: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      query: '',
      imageUrl: ''
    }
  }
})