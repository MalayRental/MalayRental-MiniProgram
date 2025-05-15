const app = getApp()
const { houseDetailService } = require('../../api/service/index');
const { isLoggedIn, navigateToLogin, getUserInfo } = require('../../utils/userUtils');
const { addFavoriteItem, removeFavoriteItem, checkFavoriteStatus } = require('../../api/service/favoriteService');
const { chatService } = require('../../api/service/index');

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
        // 处理图片，coverImage放首位
        let images = [];
        if (detail.coverImage) {
          images.push(detail.coverImage);
        }
        if (detail.detailImages && Array.isArray(detail.detailImages)) {
          images = images.concat(detail.detailImages);
        } else if (detail.detailImages && typeof detail.detailImages === 'string') {
          images = images.concat(detail.detailImages.split(','));
        }
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
          images: images,
          owner: {
            id: detail.ownerId,
            name: detail.ownerName,
            avatar: detail.ownerAvatar,
            phone: detail.ownerPhoneNumber
          }
        };
        this.setData({
          house,
          houseId: houseId
        });
        // 检查收藏状态
        const userInfo = getUserInfo();
        if (userInfo && userInfo.userId) {
          checkFavoriteStatus(userInfo.userId, houseId)
            .then(isCollected => {
              this.setData({ isCollected });
            });
        } else {
          this.setData({ isCollected: false });
        }
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
    if (!isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => { navigateToLogin(); }, 800);
      return;
    }
    const userInfo = getUserInfo();
    if (!userInfo || !userInfo.userId) {
      wx.showToast({ title: '用户信息异常', icon: 'none' });
      return;
    }
    const houseId = this.data.houseId;
    const isCollected = this.data.isCollected;
    wx.showLoading({ title: isCollected ? '取消中...' : '收藏中...' });
    const action = isCollected ? removeFavoriteItem : addFavoriteItem;
    action(userInfo.userId, houseId)
      .then(() => {
        this.setData({ isCollected: !isCollected });
        wx.hideLoading();
        wx.showToast({
          title: !isCollected ? '已收藏' : '已取消收藏',
          icon: 'success',
          duration: 1500
        });
      })
      .catch(err => {
        wx.hideLoading();
        wx.showToast({ title: (isCollected ? '取消收藏失败' : '收藏失败'), icon: 'none' });
      });
  },

  // 在线聊天
  onlineChat: function() {
    if (!isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => { navigateToLogin(); }, 800);
      return;
    }
    const userInfo = getUserInfo();
    const ownerId = this.data.house.owner && this.data.house.owner.id;
    if (userInfo && userInfo.userId && ownerId) {
      wx.showLoading({ title: '进入聊天...' });
      chatService.createChat(userInfo.userId, ownerId)
        .then(chatData => {
          wx.hideLoading();
          wx.navigateTo({
            url: `/pages/chatOnline/index?id=${chatData.chatId}` +
              `&staffAvatar=${encodeURIComponent(chatData.staffAvatar)}` +
              `&staffStatus=${chatData.staffStatus}` +
              `&staffName=${encodeURIComponent(chatData.staffName)}` +
              `&staffId=${chatData.staffId}`
          });
        })
        .catch(err => {
          wx.hideLoading();
          wx.showToast({ title: err || '进入聊天失败', icon: 'none' });
        });
    } else {
      wx.showToast({ title: '无房东信息', icon: 'none' });
    }
  },

  // 电话联系
  phoneCall: function() {
    if (!isLoggedIn()) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => { navigateToLogin(); }, 800);
      return;
    }
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