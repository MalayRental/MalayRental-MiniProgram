const app = getApp()

// 账号资料页面
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      age: '',
      phone: '',
      email: '',
      bio: ''
    },
    genders: ['未设置', '男', '女'],
    genderIndex: 0
  },

  onLoad: function (options) {
    // 获取用户信息
    this.getUserInfo();
  },

  getUserInfo: function () {
    // 这里可以从后端获取用户信息
    // 示例数据
    const userInfo = {
      avatarUrl: '/assets/images/user-avatar.jpg',
      nickName: '用户昵称',
      gender: 1,
      age: '28',
      phone: '13800138000',
      email: 'example@mail.com',
      bio: '这是一段个人简介，描述自己的特点和租房需求等。'
    };
    
    this.setData({
      userInfo,
      genderIndex: userInfo.gender
    });
  },

  chooseAvatar: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'userInfo.avatarUrl': tempFilePath
        });
        
        // 这里可以调用上传接口
        this.uploadAvatar(tempFilePath);
      }
    });
  },

  uploadAvatar: function (filePath) {
    // 上传头像的逻辑
    wx.showLoading({
      title: '上传中...',
    });
    
    // 模拟上传
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
    }, 1500);
  },

  inputNickname: function (e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  bindGenderChange: function (e) {
    this.setData({
      genderIndex: parseInt(e.detail.value),
      'userInfo.gender': parseInt(e.detail.value)
    });
  },

  inputAge: function (e) {
    this.setData({
      'userInfo.age': e.detail.value
    });
  },

  inputPhone: function (e) {
    this.setData({
      'userInfo.phone': e.detail.value
    });
  },

  inputEmail: function (e) {
    this.setData({
      'userInfo.email': e.detail.value
    });
  },

  inputBio: function (e) {
    this.setData({
      'userInfo.bio': e.detail.value
    });
  },

  saveUserInfo: function () {
    wx.showLoading({
      title: '保存中...',
    });
    
    // 这里可以调用保存接口
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
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
  }
}) 