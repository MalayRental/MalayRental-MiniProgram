const app = getApp()

Page({
  data: {
    feedbackType: '', // 反馈类型
    feedback: '',     // 反馈内容
    uploadedImages: [], // 上传的图片
    contact: '',      // 联系方式
    submitDisabled: true // 提交按钮是否禁用
  },

  onLoad: function(options) {
    // 如果是从其他页面跳转过来，可以设置初始值
    if (options.type) {
      this.setData({
        feedbackType: options.type
      });
    }
  },
  
  // 选择反馈类型
  selectType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      feedbackType: type
    });
    this.checkSubmitStatus();
  },
  
  // 输入反馈内容
  inputFeedback: function(e) {
    this.setData({
      feedback: e.detail.value
    });
    this.checkSubmitStatus();
  },
  
  // 输入联系方式
  inputContact: function(e) {
    this.setData({
      contact: e.detail.value
    });
  },
  
  // 选择图片
  chooseImage: function() {
    const currentCount = this.data.uploadedImages.length;
    const remainCount = 3 - currentCount;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多只能上传3张图片',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 上传成功后的临时路径
        const tempFilePaths = res.tempFilePaths;
        
        // 更新图片数组
        const newImages = [...this.data.uploadedImages, ...tempFilePaths];
        
        this.setData({
          uploadedImages: newImages
        });
        
        // 这里可以添加实际上传图片到服务器的逻辑
        // this.uploadImages(tempFilePaths);
      }
    });
  },
  
  // 删除图片
  deleteImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.uploadedImages;
    
    images.splice(index, 1);
    
    this.setData({
      uploadedImages: images
    });
  },
  
  // 检查提交按钮状态
  checkSubmitStatus: function() {
    const { feedbackType, feedback } = this.data;
    const disabled = !feedbackType || !feedback;
    
    this.setData({
      submitDisabled: disabled
    });
  },
  
  // 提交反馈
  submitFeedback: function() {
    const { feedbackType, feedback, contact, uploadedImages } = this.data;
    
    // 验证必填项
    if (!feedbackType) {
      wx.showToast({
        title: '请选择反馈类型',
        icon: 'none'
      });
      return;
    }
    
    if (!feedback || feedback.trim() === '') {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载状态
    wx.showLoading({
      title: '提交中...',
    });
    
    // 这里应该是实际的提交逻辑，现在只是模拟
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }, 1500);
  },

  onShareAppMessage: function () {
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