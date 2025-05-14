const app = getApp()
const { houseDetailService } = require('../../api/service/index');

Page({
  data: {
    houseId: null,
    isCollected: false, // 是否收藏
    house: {}
  },

  onLoad: function(options) {
    // 获取路由参数中的房源ID
    const { id } = options;
    if (id) {
      this.setData({
        houseId: id
      });
      this.fetchHouseDetail(id);
    }
  },

  // 获取房源详情
  fetchHouseDetail: function(houseId) {
    wx.showLoading({ title: '加载中...' });
    houseDetailService.getHouseDetail(houseId)
      .then(detail => {
        // 格式化页面所需字段
        const house = {
          id: detail.houseId,
          houseName: detail.houseName,
          price: detail.price,
          area: detail.area,
          address: detail.address,
          orientation: detail.orientation,
          proportion: detail.proportion,
          moveInDate: detail.availableDate,
          paymentMethod: detail.paymentMethods ? detail.paymentMethods.split(',') : [],
          facilities: detail.facility ? detail.facility.split(',') : [],
          community: detail.community,
          introduction: detail.desc,
          brokerageFee: detail.agencyFees,
          uploadTime: detail.createTime,
          lastUpdate: detail.updateTime,
          tags: detail.tags ? detail.tags.split(',') : [],
          images: detail.detailImages || [],
          owner: {
            id: detail.ownerId,
            name: detail.ownerName,
            avatar: detail.ownerAvatar,
            phone: detail.ownerPhoneNumber
          }
        };
        this.setData({
          house,
          isCollected: detail.favoriteStatus
        });
        wx.hideLoading();
      })
      .catch(error => {
        wx.hideLoading();
        wx.showToast({
          title: '获取详情失败',
          icon: 'none'
        });
      });
  },

  // 切换收藏状态
  toggleCollect: function() {
    this.setData({
      isCollected: !this.data.isCollected
    });
    // 这里应该请求后端API更新收藏状态
    wx.showToast({
      title: this.data.isCollected ? '已收藏' : '已取消收藏',
      icon: 'success',
      duration: 1500
    });
  },

  // 在线聊天
  onlineChat: function() {
    const ownerId = this.data.house.owner && this.data.house.owner.id;
    if (ownerId) {
      wx.navigateTo({ url: `/pages/chatOnline/index?id=${ownerId}` });
    } else {
      wx.showToast({ title: '无房东信息', icon: 'none' });
    }
  },

  // 电话联系
  phoneCall: function() {
    const phone = this.data.house.owner && this.data.house.owner.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    } else {
      wx.showToast({ title: '无联系电话', icon: 'none' });
    }
  },

  // 查看图片
  previewImage: function(e) {
    const { current } = e.currentTarget.dataset;
    wx.previewImage({
      current: current,
      urls: this.data.house.images
    });
  }
}) 