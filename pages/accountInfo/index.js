const app = getApp()
const { getAccountInfo, updateAccountInfo, updateUserAvatar } = require('../../api/service/userAccountService');
const { getUserInfo } = require('../../utils/userUtils');
const { uploadAvatar } = require('../../api/service/imageUploadService');
const { BASE_URL } = require('../../api/api');

// 账号资料页面
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '',
      fullName: '',
      gender: 0,
      age: '',
      phone: '',
      email: '',
      school: '',
      bio: ''
    },
    genders: ['保密', '男', '女'],
    genderIndex: 0
  },

  onLoad: function (options) {
    // 获取用户信息
    this.fetchAccountInfo();
  },

  fetchAccountInfo: function () {
    const localUserInfo = getUserInfo();
    if (!localUserInfo || !localUserInfo.userId) {
      wx.showToast({ title: '未登录', icon: 'none' });
      return;
    }
    getAccountInfo({ userId: localUserInfo.userId }).then(res => {
      if (res.code === 200 && res.data) {
        const data = res.data;
        this.setData({
          userInfo: {
            avatarUrl:
              !data.avatar || data.avatar.includes('default-avatar.png')
                ? '/assets/images/default-avatar.png'
                : (data.avatar.startsWith('http') || data.avatar.startsWith('https')
                    ? data.avatar
                    : (BASE_URL + '/api/images/avatar/' + data.avatar)),
            nickName: data.userName || '',
            fullName: data.fullName || '',
            gender: data.gender === '男' ? 1 : (data.gender === '女' ? 2 : 0),
            age: data.age || '',
            phone: data.phoneNumber || '',
            email: data.email || '',
            school: data.school || '',
            bio: data.bio || ''
          },
          genderIndex: data.gender === '男' ? 1 : (data.gender === '女' ? 2 : 0)
        });
      } else {
        wx.showToast({ title: res.message || '获取资料失败', icon: 'none' });
      }
    }).catch(() => {
      wx.showToast({ title: '获取资料失败', icon: 'none' });
    });
  },

  chooseAvatar: function () {
    const localUserInfo = getUserInfo();
    if (!localUserInfo || !localUserInfo.userId) {
      wx.showToast({ title: '未登录', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.showLoading({ title: '上传中...' });
        uploadAvatar(tempFilePath).then(uploadRes => {
          const filename = uploadRes.data.filename;
          // 更新用户头像信息
          return updateUserAvatar({ userId: localUserInfo.userId, avatar: filename });
        }).then(updateRes => {
          wx.hideLoading();
          if (updateRes.code === 200) {
            wx.showToast({ title: '头像已更新', icon: 'success' });
            // 刷新用户信息
            this.fetchAccountInfo();
          } else {
            wx.showToast({ title: updateRes.message || '头像更新失败', icon: 'none' });
          }
        }).catch(() => {
          wx.hideLoading();
          wx.showToast({ title: '头像上传失败', icon: 'none' });
        });
      }
    });
  },

  inputNickname: function (e) {
    this.setData({
      'userInfo.nickName': e.detail.value
    });
  },

  bindGenderChange: function (e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      genderIndex: idx,
      'userInfo.gender': idx
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

  inputSchool: function (e) {
    this.setData({
      'userInfo.school': e.detail.value
    });
  },

  inputBio: function (e) {
    this.setData({
      'userInfo.bio': e.detail.value
    });
  },

  inputFullName: function (e) {
    this.setData({
      'userInfo.fullName': e.detail.value
    });
  },

  saveUserInfo: function () {
    const localUserInfo = getUserInfo();
    if (!localUserInfo || !localUserInfo.userId) {
      wx.showToast({ title: '未登录', icon: 'none' });
      return;
    }
    const { userInfo, genderIndex, genders } = this.data;
    wx.showLoading({
      title: '保存中...',
    });
    updateAccountInfo({
      userId: localUserInfo.userId,
      fullName: userInfo.fullName,
      gender: genders[genderIndex],
      age: userInfo.age,
      email: userInfo.email,
      school: userInfo.school,
      bio: userInfo.bio
    }).then(res => {
      wx.hideLoading();
      if (res.code === 200) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        });
      } else {
        wx.showToast({ title: res.message || '保存失败', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  onShareAppMessage: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      path: '/pages/home/index',
      imageUrl: ''
    }
  }
}) 