const { miniInfoService } = require('../../api/service/index');
Page({
  data: {
    searchValue: '',
    allHouses: [],
    resultList: [],
    guessList: [],
    hotList: []
  },
  onLoad: function() {
    const allHouses = getApp().globalData.houseList || wx.getStorageSync('houseList') || [];
    this.setData({
      allHouses
    });
    // 动态获取猜你想搜和热搜标签
    miniInfoService.getSearchKey().then(res => {
      if (res.code === 200 && res.data) {
        this.setData({
          guessList: res.data.guess || [],
          hotList: res.data.hot || []
        });
      }
    });
  },
  onInput: function(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchValue: keyword });
    if (!keyword) {
      this.setData({ resultList: [] });
      return;
    }
    const result = this.data.allHouses.filter(item => item.houseName.indexOf(keyword) !== -1);
    this.setData({ resultList: result });
  },
  clearSearch: function() {
    this.setData({
      searchValue: '',
      resultList: []
    });
  },
  onTagTap: function(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchValue: keyword });
    const result = this.data.allHouses.filter(item => item.houseName.indexOf(keyword) !== -1);
    this.setData({ resultList: result });
  },
  navigateToDetail: function(e) {
    const { houseid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${houseid}`
    });
  }
}); 