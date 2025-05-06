Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0,
    activeTab: 0,
    tabList: [
      { value: 0, label: '房东合作' },
      { value: 1, label: '商家合作' }
    ],
    formData: {
      name: '',
      phone: '',
      wechat: '',
      email: '',
      type: '房东',
      houseInfo: '',
      businessInfo: '',
      message: ''
    },
    uploading: false,
    uploadFiles: [],
    cooperationInfo: {
      landlord: {
        title: '成为房东合作伙伴',
        benefits: [
          '免费发布房源，获得更多优质租客',
          '平台提供专业的房源推广服务',
          '获得租金托管和房屋管理服务',
          '享受房源维护和紧急事务处理',
          '获得专业的法律和合同支持'
        ],
        process: [
          '填写并提交房东合作申请表',
          '平台审核您的信息（1-2个工作日）',
          '签订房东合作协议',
          '上传房源信息并通过审核',
          '正式发布房源开始获客'
        ]
      },
      business: {
        title: '成为商业合作伙伴',
        benefits: [
          '获得精准的客户流量和品牌曝光',
          '针对留学生和华人群体的精准营销',
          '定制化的线上线下营销活动',
          '共同探索创新的业务模式',
          '优先参与平台举办的各类活动'
        ],
        process: [
          '填写并提交商业合作申请表',
          '平台审核您的信息（3-5个工作日）',
          '商务团队联系洽谈合作细节',
          '签订正式合作协议',
          '启动合作项目并持续优化'
        ]
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 如果从其他页面传递了合作类型，则设置对应的tab
    if (options.type) {
      this.setData({
        activeTab: options.type === 'business' ? 1 : 0
      });
    }
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
      title: '大马租房 - 与我们合作',
      path: '/pages/cooperation/index'
    }
  },

  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },

  // 切换Tab
  onTabChange(e) {
    const activeTab = e.detail.value;
    
    // 重置表单数据
    const formData = {
      name: '',
      phone: '',
      wechat: '',
      email: '',
      type: activeTab === 0 ? '房东' : '商家',
      houseInfo: '',
      businessInfo: '',
      message: ''
    };
    
    this.setData({
      activeTab,
      formData,
      uploadFiles: []
    });
  },

  // 表单输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 上传图片
  chooseImage() {
    const that = this;
    wx.chooseMedia({
      count: 5,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFiles = res.tempFiles;
        const newFiles = tempFiles.map(file => ({
          url: file.tempFilePath,
          name: file.tempFilePath.split('/').pop(),
          type: 'image'
        }));
        
        that.setData({
          uploadFiles: [...that.data.uploadFiles, ...newFiles].slice(0, 5)
        });
      }
    });
  },

  // 删除上传的图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const uploadFiles = this.data.uploadFiles.filter((_, i) => i !== index);
    
    this.setData({
      uploadFiles
    });
  },

  // 提交表单
  submitForm() {
    // 表单验证
    const { name, phone, type } = this.data.formData;
    
    if (!name) {
      this.showError('请输入您的姓名');
      return;
    }
    
    if (!phone) {
      this.showError('请输入您的手机号码');
      return;
    }
    
    // 模拟表单提交
    this.setData({
      uploading: true
    });
    
    // 模拟上传处理
    setTimeout(() => {
      this.setData({
        uploading: false
      });
      
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      });
      
      // 重置表单
      const formData = {
        name: '',
        phone: '',
        wechat: '',
        email: '',
        type: this.data.activeTab === 0 ? '房东' : '商家',
        houseInfo: '',
        businessInfo: '',
        message: ''
      };
      
      this.setData({
        formData,
        uploadFiles: []
      });
    }, 1500);
  },
  
  // 显示错误信息
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'error',
      duration: 2000
    });
  },
  
  // 复制微信号
  copyWechat() {
    wx.setClipboardData({
      data: 'malayrental',
      success: function() {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success'
        });
      }
    });
  }
}) 