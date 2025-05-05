// pages/login/index.js
const { request, api } = require('../../utils/request');
const { ensureFullAvatarUrl } = require('../../utils/dataAdapter');

Page({
  data: {
    account: '',
    password: '',
    isLoading: false,
    isWxLoading: false,
    errorMessage: '',
    navBarHeight: 0,
    fromPage: '' // 记录来源页面
  },

  onLoad(options) {
    // 如果有账号参数，填充到账号输入框（从注册页面返回）
    if (options.account) {
      this.setData({
        account: options.account
      });
    }
    
    // 保存来源页面，用于登录成功后的跳转
    if (options.from) {
      this.setData({
        fromPage: options.from
      });
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
  },
  
  // 处理微信登录
  wxLogin(e) {
    // 新版微信小程序不再支持通过open-type="getUserInfo"获取用户信息
    this.setData({ isWxLoading: true, errorMessage: '' });
    
    // 直接使用wx.login获取临时登录凭证code
    wx.login({
      success: res => {
        if (res.code) {
          console.log('获取微信登录code成功:', res.code);
          
          // 直接尝试自动注册/登录
          api.autoRegisterWithWx(res.code)
            .then(loginRes => {
              this.setData({ isWxLoading: false });
              
              if (loginRes.success && loginRes.user) {
                // 保存用户信息
                wx.setStorageSync('userInfo', loginRes.user);
                wx.setStorageSync('isLoggedIn', true);
                
                // 微信登录也显示成功提示
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 1500
                });
                
                // 延迟导航，让用户看到提示
                setTimeout(() => {
                  this.handleLoginSuccess();
                }, 1500);
              } else {
                this.showError(loginRes.message || '微信登录失败');
              }
            })
            .catch(err => {
              this.setData({ isWxLoading: false });
              this.showError('微信登录失败，请稍后重试');
              console.error('微信登录错误:', err);
            });
        } else {
          this.setData({ isWxLoading: false });
          this.showError('获取微信登录信息失败');
          console.error('获取微信登录code失败:', res.errMsg);
        }
      },
      fail: err => {
        this.setData({ isWxLoading: false });
        this.showError('微信登录授权失败');
        console.error('wx.login调用失败:', err);
      }
    });
  },

  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },

  // 输入账号
  onAccountInput(e) {
    const value = e.detail.value;
    // 只允许输入数字
    if (value && !/^\d*$/.test(value)) {
      wx.showToast({
        title: '请输入有效的手机号',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    this.setData({
      account: value
    });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 验证手机号格式
  validatePhoneNumber(phoneNumber) {
    // 中国大陆手机号格式：1开头的11位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  },

  // 处理登录成功后的跳转
  handleLoginSuccess() {
    const pages = getCurrentPages();
    
    // 判断跳转目标页面
    if (this.data.fromPage === 'mine') {
      // 如果是从"我的"页面来的，返回到"我的"页面
      wx.switchTab({
        url: '/pages/mine/index'
      });
    } else if (this.data.fromPage === 'chat') {
      // 如果是从聊天页面来的，返回到聊天页面
      wx.navigateBack();
    } else if (pages.length > 1) {
      // 如果有上一页，则返回上一页
      wx.navigateBack();
    } else {
      // 默认跳转到"我的"页面
      wx.switchTab({
        url: '/pages/mine/index'
      });
    }
  },

  // 登录
  login() {
    const { account, password } = this.data;
    
    if (!account.trim()) {
      this.showError('请输入手机号');
      return;
    }
    
    if (!this.validatePhoneNumber(account)) {
      this.showError('请输入有效的手机号');
      return;
    }
    
    if (!password.trim()) {
      this.showError('请输入密码');
      return;
    }
    
    this.normalLogin(account, password);
  },
  
  // 普通账号密码登录
  normalLogin(account, password) {
    this.setData({ isLoading: true, errorMessage: '' });
    
    request('/users/login', 'POST', { account, password })
      .then(res => {
        this.setData({ isLoading: false });
        
        if (res.success) {
          // 原样保存用户信息，不对头像进行处理
          // 头像处理逻辑交给显示页面处理
          wx.setStorageSync('userInfo', res.user);
          wx.setStorageSync('isLoggedIn', true);
          
          // 显示成功提示
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });
          
          // 登录成功后的跳转逻辑
          setTimeout(() => {
            this.handleLoginSuccess();
          }, 1500);
        } else {
          // 显示服务器返回的错误信息
          this.showError(res.message || '登录失败，请检查账号和密码');
        }
      })
      .catch(err => {
        this.setData({ isLoading: false });
        
        // 处理错误对象，提取服务器返回的错误信息
        let errorMessage = '登录失败，请稍后重试';
        
        if (err) {
          if (typeof err === 'string') {
            errorMessage = err;
          } else if (err.message) {
            errorMessage = err.message;
          } else if (err.statusCode) {
            // 处理不同状态码错误
            if (err.statusCode === 401) {
              errorMessage = '账号或密码错误';
            } else if (err.statusCode === 400) {
              errorMessage = '请求参数错误，请检查输入';
            }
            
            // 如果错误对象中包含详细信息，优先使用
            if (err.data && err.data.message) {
              errorMessage = err.data.message;
            }
          }
        }
        
        this.showError(errorMessage);
        console.error('登录错误：', err);
      });
  },
  
  // 去注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/login/register'
    });
  },
  
  // 返回我的页面
  goBack() {
    // 判断是否可以返回上一页
    const pages = getCurrentPages();
    
    if (pages.length > 1) {
      // 有上一页，直接返回
      wx.navigateBack();
    } else {
      // 没有上一页，默认跳转到"我的"页面
      wx.switchTab({
        url: '/pages/mine/index'
      });
    }
  },
  
  // 显示错误消息
  showError(message) {
    this.setData({ errorMessage: message });
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2500,
      // 调大错误提示的字体
      style: 'font-size: 28rpx; font-weight: 500;'
    });
  }
}) 