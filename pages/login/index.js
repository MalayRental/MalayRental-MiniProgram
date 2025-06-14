// 登录页面逻辑
const app = getApp();
const userUtils = require('../../utils/userUtils');
const { userAccountService } = require('../../api/service/index');
const { getImageUrl } = require('../../api/service/imageGetService');

Page({
  data: {
    phoneNumber: '', // 手机号
    password: '', // 密码
    isAgree: false, // 是否同意协议
    phoneNumberFocus: false, // 手机号输入框是否聚焦
    passwordFocus: false // 密码输入框是否聚焦
  },

  // 处理手机号输入
  handlePhoneNumberInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 处理密码输入
  handlePasswordInput: function(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 处理手机号输入框聚焦
  handlePhoneNumberFocus: function() {
    this.setData({
      phoneNumberFocus: true
    });
  },

  // 处理手机号输入框失焦
  handlePhoneNumberBlur: function() {
    this.setData({
      phoneNumberFocus: false
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

  // 处理协议勾选变化
  handleAgreementChange: function(e) {
    this.setData({
      isAgree: e.detail.value.length > 0
    });
  },

  // 处理登录按钮点击
  handleLogin: function() {
    const { phoneNumber, password, isAgree } = this.data;
    
    // 表单验证
    if (!phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      });
      return;
    }
    
    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }
    
    if (!isAgree) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '登录中',
      mask: true
    });
    
    // 发起登录请求
    userAccountService.login({
      phoneNumber,
      password
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
        
        // 提示登录成功
        wx.showToast({
          title: '登录成功',
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
      } else {
        // 登录失败提示
        wx.showToast({
          title: res.message || '登录失败，请重试',
          icon: 'none'
        });
      }
    }).catch(err => {
      // 隐藏加载提示
      wx.hideLoading();
      
      // 提示错误
      wx.showToast({
        title: err || '登录失败，请重试',
        icon: 'none'
      });
    });
  },

  // 处理微信一键登录
  handleWechatLogin: function() {
    // 判断是否同意协议
    if (!this.data.isAgree) {
      wx.showToast({
        title: '请先同意用户协议和隐私政策',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '微信登录中',
      mask: true
    });
    
    // 调用wx.login获取code
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取到微信的code，调用后端接口
          userAccountService.wxLogin({
            code: res.code
          }).then(loginRes => {
            wx.hideLoading();
            
            if (loginRes.code === 200) {
              // 微信登录成功
              // 保存登录信息
              userUtils.saveLoginInfo(loginRes.data);
              
              // 获取用户信息
              const userInfo = userUtils.getUserInfo();
              
              // 处理用户头像URL
              if (userInfo && userInfo.avatar) {
                userInfo.avatar = getImageUrl('avatar', userInfo.avatar);
              }
              
              // 更新全局数据
              userUtils.setLoggedIn(app, userInfo);
              
              // 提示登录成功
              wx.showToast({
                title: '微信登录成功',
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
            } else if (loginRes.code === 201) {
              // 未绑定账号，需要进行注册
              console.log('收到code 201响应，跳转到注册页面', loginRes);
              
              // 保存openId
              if (loginRes.data && loginRes.data.openId) {
                userUtils.saveOpenId(loginRes.data.openId);
                
                // 直接跳转到注册页面
                wx.navigateTo({
                  url: '/pages/wxRegister/index?openId=' + loginRes.data.openId
                });
              } else {
                // openId不存在的情况
                wx.showToast({
                  title: '登录失败，未获取到微信信息',
                  icon: 'none'
                });
              }
            } else {
              // 其他错误情况
              wx.showToast({
                title: loginRes.message || '微信登录失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            wx.hideLoading();
            
            // 处理错误
            wx.showToast({
              title: err.message || '微信登录失败，请重试',
              icon: 'none'
            });
          });
        } else {
          wx.hideLoading();
          
          // 获取code失败
          wx.showToast({
            title: '微信登录失败: ' + (res.errMsg || '获取code失败'),
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        
        // 登录失败
        wx.showToast({
          title: '微信登录失败: ' + (err.errMsg || '未知错误'),
          icon: 'none'
        });
      }
    });
  },

  // 跳转到注册页面
  navigateToRegister: function() {
    wx.navigateTo({
      url: '/pages/register/index'
    });
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
  }
}); 