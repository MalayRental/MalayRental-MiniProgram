// map.js
const { houses } = require('../../utils/houses.js');
const { getHouseList } = require('../../api/service/houseListService.js');

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
    defaultImage: 'http://192.168.1.9:8080/api/images/banner/5514c926-c121-4177-b4ac-41879c6652cf.jpeg',
    loadingHouses: true,
    loadError: false
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
    } else {
      // 如果没有传入城市参数，获取用户位置
      this.getUserLocation();
    }

    // 获取房源数据并格式化为地图标记点
    this.loadHouseMarkers();
  },

  // 获取用户位置
  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          cityName: '当前位置'
        });
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败，使用默认位置',
          icon: 'none'
        });
      }
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
        this.processHouseData(houses);
      })
      .catch(error => {
        console.error('从API获取房源失败，使用本地数据:', error);
        // 使用本地数据作为备选
        this.processHouseData(houses);
      });
  },

  // 处理房源数据
  processHouseData(houseData) {
    console.log('加载标记，房源数量:', houseData.length);
    
    // 处理房源数据，确保图片路径正确
    const processedHouses = houseData.map(house => {
      return {
        ...house,
        // 统一使用指定的图片
        imgUrl: this.data.defaultImage
      };
    });
    
    // 使用上传的图标
    const markers = processedHouses.map(house => {
      return {
        id: house.id,
        latitude: house.latitude,
        longitude: house.longitude,
        width: 40,
        height: 40,
        iconPath: '/assets/icons/icon-locate.png',
        callout: {
          content: `${house.title || house.houseName}\nRM${house.price}/月`,
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
      markers,
      processedHouses,
      loadingHouses: false
    });
  },

  // 点击标记点时触发
  onMarkerTap(e) {
    console.log('点击了标记:', e);
    const markerId = e.markerId;
    const house = this.data.processedHouses.find(h => h.id === markerId) || 
                 houses.find(h => h.id === markerId);
    
    if (house) {
      console.log('找到房源:', house.title || house.houseName);
      
      // 先隐藏当前显示的信息面板，然后设置新的房源并显示
      this.setData({
        showHouseInfo: false,
        currentHouse: null
      }, () => {
        // 使用setTimeout确保DOM更新后再显示新面板
        setTimeout(() => {
          this.setData({
            currentHouse: house,
            showHouseInfo: true
          });
        }, 50);
      });
    } else {
      console.log('未找到对应房源');
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
    // 只使用H001和H002两个房源ID
    const availableHouseIds = ['H001'];
    
    // 随机选择一个房源ID
    const randomIndex = Math.floor(Math.random() * availableHouseIds.length);
    const randomHouseId = availableHouseIds[randomIndex];
    
    console.log('随机跳转到房源详情，ID:', randomHouseId);
    
    // 跳转到房源详情页面
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${randomHouseId}`,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        });
      }
    });
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
      title: `${this.data.cityName}房源地图`,
      path: `/pages/map/index?latitude=${this.data.latitude}&longitude=${this.data.longitude}&cityName=${this.data.cityName}`
    };
  }
}) 