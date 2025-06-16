// 注册页面逻辑
const app = getApp();
const userUtils = require('../../utils/userUtils');
const { userAccountService } = require('../../api/service/index');

Page({
  data: {
    phone: '', // 手机号
    nickname: '', // 用户昵称
    password: '', // 密码
    confirmPassword: '', // 确认密码
    isAgree: false, // 是否同意协议，整改为默认false
    phoneFocus: false, // 手机号输入框是否聚焦
    nicknameFocus: false, // 用户昵称输入框是否聚焦
    passwordFocus: false, // 密码输入框是否聚焦
    confirmPasswordFocus: false // 确认密码输入框是否聚焦
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

  // 处理密码输入
  handlePasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 处理确认密码输入
  handleConfirmPasswordInput: function(e) {
    this.setData({
      confirmPassword: e.detail.value
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

  // 处理密码输入框聚焦
  handlePasswordFocus: function() {
    this.setData({
      passwordFocus: true
    });
  },

  // 处理密码输入框失焦
  handlePasswordBlur: function() {
    this.setData({
      passwordFocus: false
    });
  },

  // 处理确认密码输入框聚焦
  handleConfirmPasswordFocus: function() {
    this.setData({
      confirmPasswordFocus: true
    });
  },

  // 处理确认密码输入框失焦
  handleConfirmPasswordBlur: function() {
    this.setData({
      confirmPasswordFocus: false
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
    const { phone, nickname, password, confirmPassword, isAgree } = this.data;
    
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
    
    // 密码验证
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    
    // 增强的密码强度验证
    if (password.length < 6 || password.length > 20) {
      wx.showToast({
        title: '密码长度应为6-20位',
        icon: 'none'
      });
      return;
    }
    
    // 检查密码是否包含字母和数字
    if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d_]+$/.test(password)) {
      wx.showToast({
        title: '密码应包含字母和数字',
        icon: 'none'
      });
      return;
    }
    
    // 确认密码验证
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
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
    
    // 使用userAccountService发起注册请求
    userAccountService.register({
      phoneNumber: phone,
      userName: nickname,
      password: password
    }).then(res => {
      // 隐藏加载提示
      wx.hideLoading();
      
      if (res.code === 200) {
        // 提示注册成功
        wx.showToast({
          title: res.message || '注册成功',
          icon: 'success',
          duration: 1500,
          mask: true,
          success: () => {
            // 延迟跳转到登录页面
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }
        });
      } else {
        // 注册失败提示
        wx.showToast({
          title: res.message || '注册失败，请重试',
          icon: 'none'
        });
      }
    }).catch(err => {
      // 隐藏加载提示
      wx.hideLoading();
      
      // 提示错误
      wx.showToast({
        title: err.message || '注册失败，请重试',
        icon: 'none'
      });
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