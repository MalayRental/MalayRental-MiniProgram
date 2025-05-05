// pages/login/register.js
const { request, api } = require('../../utils/request');

Page({
  data: {
    username: '',
    account: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    errorMessage: '',
    navBarHeight: 0
  },

  onLoad(options) {
    // 如果有需要处理的选项参数
  },

  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },

  // 输入用户名
  onUsernameInput(e) {
    const value = e.detail.value;
    // 限制用户名长度不超过32个字
    if (value.length > 32) {
      wx.showToast({
        title: '用户名不能超过32个字',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    this.setData({
      username: value
    });
  },

  // 输入账号（手机号）
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

  // 输入确认密码
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  // 验证手机号格式
  validatePhoneNumber(phoneNumber) {
    // 中国大陆手机号格式：1开头的11位数字
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  },

  // 验证密码强度
  validatePassword(password) {
    // 密码至少8位，必须包含大小写字母和数字，可以包含特殊字符
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      if (password.length < 8) {
        return { valid: false, message: '密码至少需要8位' };
      }
      if (!/(?=.*[a-z])/.test(password)) {
        return { valid: false, message: '密码必须包含小写字母' };
      }
      if (!/(?=.*[A-Z])/.test(password)) {
        return { valid: false, message: '密码必须包含大写字母' };
      }
      if (!/(?=.*\d)/.test(password)) {
        return { valid: false, message: '密码必须包含数字' };
      }
      return { valid: false, message: '密码格式不符合要求' };
    }
    
    return { valid: true, message: '' };
  },

  // 注册
  register() {
    const { username, account, password, confirmPassword } = this.data;
    
    // 表单验证
    if (!username.trim()) {
      this.showError('请输入用户名');
      return;
    }
    
    if (username.length > 32) {
      this.showError('用户名不能超过32个字');
      return;
    }
    
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
    
    // 密码强度验证
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      this.showError(passwordValidation.message);
      return;
    }
    
    if (password !== confirmPassword) {
      this.showError('两次输入的密码不一致');
      return;
    }
    
    // 表单验证通过，开始注册
    this.setData({ isLoading: true, errorMessage: '' });
    
    // 调用注册接口
    request('/users/register', 'POST', {
      username,
      account,
      password
    })
      .then(res => {
        this.setData({ isLoading: false });
        
        if (res.success) {
          // 显示成功提示
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟跳转到登录页
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/login/index?account=${account}`
            });
          }, 1500);
        } else {
          // 显示服务器返回的错误信息
          this.showError(res.message || '注册失败，请稍后重试');
        }
      })
      .catch(err => {
        this.setData({ isLoading: false });
        
        // 处理错误对象
        let errorMessage = '注册失败，请稍后重试';
        
        if (err) {
          if (typeof err === 'string') {
            errorMessage = err;
          } else if (err.message) {
            errorMessage = err.message;
          } else if (err.statusCode) {
            // 处理不同状态码错误
            if (err.statusCode === 400) {
              errorMessage = '请求参数错误，请检查输入';
            } else if (err.statusCode === 409) {
              errorMessage = '该手机号已被注册';
            }
            
            // 如果错误对象中包含详细信息，优先使用
            if (err.data && err.data.message) {
              errorMessage = err.data.message;
            }
          }
        }
        
        this.showError(errorMessage);
        console.error('注册错误：', err);
      });
  },
  
  // 跳转到登录页
  goToLogin() {
    wx.navigateBack();
  },
  
  // 显示错误消息
  showError(message) {
    this.setData({ errorMessage: message });
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2500
    });
  }
}) 