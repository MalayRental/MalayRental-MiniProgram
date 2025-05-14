const app = getApp()

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
    this.setData({
      loading: true
    });
    
    // 这里应该是从服务器获取收藏数据
    // 以下是模拟数据
    setTimeout(() => {
      const favoriteList = [
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
          favoriteTime: '2023-10-15'
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
          favoriteTime: '2023-10-10'
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
          favoriteTime: '2023-10-05'
        }
      ];
      
      this.setData({
        favoriteList,
        loading: false,
        isEmpty: favoriteList.length === 0
      });
    }, 500);
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
      title: '我在马来租房收藏的好房源',
      path: '/pages/home/index'
    };
  }
}) 