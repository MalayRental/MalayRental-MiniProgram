// 微信注册页面逻辑
const app = getApp();
const userUtils = require('../../utils/userUtils');
const { userAccountService } = require('../../api/service/index');
const { getImageUrl } = require('../../api/service/imageGetService');

Page({
  data: {
    phone: '', // 手机号
    nickname: '', // 用户昵称
    isAgree: false, // 是否同意协议，整改为默认false
    phoneFocus: false, // 手机号输入框是否聚焦
    nicknameFocus: false, // 用户昵称输入框是否聚焦
    openId: '' // 微信openId
  },

  onLoad: function(options) {
    console.log('wxRegister页面onLoad', options);
    
    // 获取openId
    let openId = '';
    
    // 优先从URL参数中获取openId
    if (options && options.openId) {
      console.log('从URL获取到openId:', options.openId);
      openId = options.openId;
      // 将获取到的openId保存到本地
      userUtils.saveOpenId(openId);
    } else {
      // 如果URL中没有，则尝试从本地存储获取
      openId = userUtils.getOpenId();
      console.log('从本地存储获取到openId:', openId);
    }
    
    if (!openId) {
      console.log('未获取到openId，将返回登录页面');
      // 如果没有openId，返回登录页面
      wx.showToast({
        title: '微信授权失败，请重试',
        icon: 'none',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
      return;
    }
    
    console.log('设置openId到页面数据', openId);
    this.setData({
      openId
    });
  },

  // 处理手机号输入
  handlePhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  // 处理用户昵称输入
  handleNicknameInput: function(e) {
    this.setData({
      nickname: e.detail.value
    });
  },

  // 处理手机号输入框聚焦
  handlePhoneFocus: function() {
    this.setData({
      phoneFocus: true
    });
  },

  // 处理手机号输入框失焦
  handlePhoneBlur: function() {
    this.setData({
      phoneFocus: false
    });
  },

  // 处理用户昵称输入框聚焦
  handleNicknameFocus: function() {
    this.setData({
      nicknameFocus: true
    });
  },

  // 处理用户昵称输入框失焦
  handleNicknameBlur: function() {
    this.setData({
      nicknameFocus: false
    });
  },

  // 处理协议勾选变化
  handleAgreementChange: function(e) {
    this.setData({
      isAgree: e.detail.value.length > 0
    });
  },

  // 处理注册按钮点击
  handleRegister: function() {
    const { phone, nickname, isAgree, openId } = this.data;
    
    // 手机号验证
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    
    // 增强的手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 用户昵称验证
    if (!nickname) {
      wx.showToast({
        title: '请输入用户昵称',
        icon: 'none'
      });
      return;
    }
    
    if (nickname.length < 2 || nickname.length > 20) {
      wx.showToast({
        title: '昵称长度应为2-20个字符',
        icon: 'none'
      });
      return;
    }
    
    // 协议验证
    if (!isAgree) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '注册中',
      mask: true
    });
    
    // 使用userAccountService发起微信注册请求
    userAccountService.wxRegister({
      openId: openId,
      phoneNumber: phone,
      userName: nickname
    }).then(res => {
      // 隐藏加载提示
      wx.hideLoading();
      
      if (res.code === 200) {
        // 保存登录信息
        userUtils.saveLoginInfo(res.data);
        
        // 获取用户信息
        const userInfo = userUtils.getUserInfo();
        
        // 处理用户头像URL
        if (userInfo && userInfo.avatar) {
          userInfo.avatar = getImageUrl('avatar', userInfo.avatar);
        }
        
        // 更新全局数据
        userUtils.setLoggedIn(app, userInfo);
        
        // 提示注册成功
        wx.showToast({
          title: res.message || '微信注册成功',
          icon: 'success',
          duration: 1500,
          mask: true,
          success: () => {
            // 延迟跳转到首页
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/home/index'
              });
            }, 1500);
          }
        });
      } else if (res.code === 400 && res.message === '账号已存在') {
        // 账号已存在，提示用户去登录
        wx.showModal({
          title: '提示',
          content: '该手机号已注册，您可以直接使用该手机号和密码登录，或使用其他手机号完成注册',
          confirmText: '去登录',
          cancelText: '继续注册',
          success: (result) => {
            if (result.confirm) {
              // 用户点击"去登录"，返回登录页面
              wx.navigateBack({
                delta: 1
              });
            }
            // 用户点击"继续注册"，不做操作，让用户更换手机号
          }
        });
      } else {
        // 其他注册失败提示
        wx.showToast({
          title: res.message || '注册失败，请重试',
          icon: 'none'
        });
      }
    }).catch(err => {
      // 隐藏加载提示
      wx.hideLoading();
      
      // 检查是否是账号已存在错误
      if (err && err.message === '账号已存在') {
        // 账号已存在，提示用户去登录
        wx.showModal({
          title: '提示',
          content: '该手机号已注册，您可以直接使用该手机号和密码登录，或使用其他手机号完成注册',
          confirmText: '去登录',
          cancelText: '继续注册',
          success: (result) => {
            if (result.confirm) {
              // 用户点击"去登录"，返回登录页面
              wx.navigateBack({
                delta: 1
              });
            }
            // 用户点击"继续注册"，不做操作，让用户更换手机号
          }
        });
      } else {
        // 提示错误
        wx.showToast({
          title: err.message || '注册失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateBack();
  },

  // 跳转到用户协议页面
  navigateToUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/policy/index?type=agreement'
    });
  },

  // 跳转到隐私政策页面
  navigateToPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/policy/index?type=privacy'
    });
  },

  onShareTimeline: function () {
    return {
      title: '马来西亚租房小程序，优质房源等你来选！',
      query: '',
      imageUrl: ''
    }
  }
}); 