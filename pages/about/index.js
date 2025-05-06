Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0,
    appInfo: {
      version: 'v1.0.0',
      releaseDate: '2023年12月',
      developer: '大马租房团队',
      contact: 'support@malayrental.com',
      website: 'www.malayrental.com'
    },
    faqList: [
      {
        question: '大马租房是什么？',
        answer: '大马租房是一个专注于马来西亚房屋租赁服务的平台，为华人留学生、工作人士以及当地居民提供安全、便捷的租房服务。'
      },
      {
        question: '如何搜索房源？',
        answer: '在首页顶部搜索栏输入关键词，或使用筛选条件（区域、价格、户型等）查找符合需求的房源。'
      },
      {
        question: '如何预约看房？',
        answer: '在房源详情页点击"预约看房"按钮，填写预约信息并提交，等待房东或平台客服联系确认。'
      },
      {
        question: '房源信息如何保证真实？',
        answer: '我们的平台会对所有上架房源进行审核，确保房源图片和信息的真实性，并且提供多种渠道验证房东身份。'
      },
      {
        question: '如何成为房东？',
        answer: '请点击"与我们合作"页面，填写相关信息并提交申请，我们的工作人员会尽快与您联系。'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '大马租房 - 专注马来西亚华人租房平台',
      path: '/pages/home/index'
    }
  },

  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },

  // 跳转到与我们合作页面
  goToCooperation() {
    wx.navigateTo({
      url: '/pages/cooperation/index'
    });
  },

  // 复制联系方式
  copyContact() {
    wx.setClipboardData({
      data: this.data.appInfo.contact,
      success: function() {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        });
      }
    });
  }
}) 