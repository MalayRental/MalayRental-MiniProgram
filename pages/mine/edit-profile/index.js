const app = getApp();
const { ensureFullAvatarUrl } = require('../../../utils/dataAdapter');
const { api, BASE_URL, isUserLoggedIn } = require('../../../utils/request');
import Toast from 'tdesign-miniprogram/toast/index';

// 默认头像URL
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navBarHeight: 0,
    userInfo: {
      username: '',
      avatar: '',
      phone_number: '',
      email: ''
    },
    isSaving: false,
    // 添加调试变量
    formDebug: {
      hasChanges: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.fetchUserInfo();
  },

  /**
   * 获取用户信息
   */
  fetchUserInfo() {
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (!isUserLoggedIn()) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/index?from=edit-profile'
        });
      }, 1000);
      return;
    }

    wx.showLoading({
      title: '加载中...'
    });

    // 使用API方法获取用户信息
    api.getUserById(storedUserInfo.id)
      .then(res => {
        console.log('获取用户信息响应:', res);
        
        if (res.success && res.user) {
          const user = res.user;
          // 处理头像URL
          let avatarUrl = user.avatar;
          if (user.avatar && user.avatar !== 'default') {
            avatarUrl = ensureFullAvatarUrl(user.avatar);
          }

          // 记录获取的用户信息
          console.log('原始用户信息:', user);

          this.setData({
            userInfo: {
              id: user.id,
              username: user.username || '',
              avatar: avatarUrl,
              phone_number: user.phone_number || '',
              email: user.email || ''
            }
          });

          // 记录设置到表单的数据
          console.log('设置到表单的数据:', this.data.userInfo);
        } else {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message || '获取用户信息失败',
            theme: 'error'
          });
        }
      })
      .catch(err => {
        console.error('获取用户信息失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: err.message || '网络错误，请稍后重试',
          theme: 'error'
        });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 输入框内容变化处理
   */
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    console.log(`输入框变化 [${field}] - 值: "${value}"`);
    
    // 记录表单有变化
    this.setData({
      [`userInfo.${field}`]: value,
      'formDebug.hasChanges': true
    });
    
    // 记录当前表单数据状态
    console.log('当前表单数据:', this.data.userInfo);
  },

  /**
   * 微信昵称变化处理
   */
  onNicknameChange(e) {
    // t-input组件的change事件结构
    const value = e.detail.value || '';
    console.log(`昵称变化 - 值: "${value}"`);
    
    this.setData({
      'userInfo.username': value,
      'formDebug.hasChanges': true
    });
    
    console.log('当前表单数据:', this.data.userInfo);
  },

  /**
   * 微信开放能力-选择头像
   */
  onChooseAvatar(e) {
    try {
      const { avatarUrl } = e.detail;
      console.log('选择头像:', avatarUrl);
      
      // 更新界面上的头像
      this.setData({
        'userInfo.avatar': avatarUrl,
        'formDebug.hasChanges': true
      });
      
      // 在开发者工具中可能会出错，添加错误处理
      try {
        // 上传头像到服务器
        this.uploadAvatar(avatarUrl);
      } catch (error) {
        console.error('上传头像失败(开发工具环境):', error);
        
        // 在开发者工具中提供备选方案
        if (wx.getSystemInfoSync().platform === 'devtools') {
          Toast({
            context: this,
            selector: '#t-toast',
            message: '开发工具中不支持头像上传，请在真机测试',
            theme: 'warning'
          });
          
          // 仅在本地更新头像，不上传到服务器
          const storedUserInfo = wx.getStorageSync('userInfo');
          if (storedUserInfo) {
            const newUserInfo = {
              ...storedUserInfo,
              avatar: avatarUrl
            };
            wx.setStorageSync('userInfo', newUserInfo);
          }
        }
      }
    } catch (mainError) {
      console.error('处理头像选择失败:', mainError);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '头像处理失败，请稍后重试',
        theme: 'error'
      });
    }
  },

  /**
   * 上传头像
   */
  uploadAvatar(filePath) {
    const storedUserInfo = wx.getStorageSync('userInfo');
    
    // 验证是否登录
    if (!isUserLoggedIn()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '登录已失效，请重新登录',
        theme: 'error'
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/index?from=edit-profile'
        });
      }, 1500);
      return;
    }
    
    wx.showLoading({
      title: '上传中...'
    });

    // 使用正确的接口路径
    const uploadUrl = `${BASE_URL}/upload/image?type=avatar`;
    
    console.log('准备上传头像:', {
      url: uploadUrl,
      filePath,
      userId: storedUserInfo.id
    });

    wx.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'image', // 后端期望的字段名是image
      method: 'POST',
      header: {
        'user-id': storedUserInfo.id,
        'content-type': 'multipart/form-data'
      },
      formData: {
        userId: storedUserInfo.id,
        type: 'avatar'
      },
      success: (res) => {
        console.log('上传头像响应:', res);
        try {
          const data = JSON.parse(res.data);
          if (data.success) {
            // 从返回的数据中正确提取文件路径
            const filePath = data.fileName || '';
            
            // 更新头像显示
            this.setData({
              'userInfo.avatar': ensureFullAvatarUrl(filePath)
            });
            
            // 同时更新本地存储的用户信息
            const newUserInfo = {
              ...storedUserInfo,
              avatar: filePath
            };
            wx.setStorageSync('userInfo', newUserInfo);
            
            // 保存头像到用户信息
            this.updateUserAvatar(filePath);
            
            Toast({
              context: this,
              selector: '#t-toast',
              message: '头像上传成功',
              theme: 'success'
            });
          } else {
            Toast({
              context: this,
              selector: '#t-toast',
              message: data.message || '上传失败',
              theme: 'error'
            });
          }
        } catch (error) {
          console.error('解析上传响应失败:', error, '原始响应:', res.data);
          Toast({
            context: this,
            selector: '#t-toast',
            message: '上传失败，请稍后重试',
            theme: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('上传头像失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: `上传失败: ${err.errMsg || '网络错误'}`,
          theme: 'error'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  /**
   * 更新用户头像到数据库
   */
  updateUserAvatar(avatarPath) {
    if (!avatarPath) return;
    
    const storedUserInfo = wx.getStorageSync('userInfo');
    if (!storedUserInfo || !storedUserInfo.id) return;
    
    // 准备更新用户头像的请求
    const requestData = {
      avatar: avatarPath
    };
    
    console.log('更新用户头像:', requestData);
    
    // 使用API更新用户信息
    wx.request({
      url: `${BASE_URL}/users/${storedUserInfo.id}`,
      method: 'PUT',
      data: requestData,
      header: {
        'content-type': 'application/json',
        'user-id': storedUserInfo.id,
        'user-type': 'client'
      },
      success: (res) => {
        console.log('更新用户头像响应:', res);
        if (!(res.statusCode >= 200 && res.statusCode < 300 && res.data.success)) {
          console.error('更新用户头像失败:', res.data);
        }
      },
      fail: (err) => {
        console.error('更新用户头像请求失败:', err);
      }
    });
  },

  /**
   * 保存用户信息
   */
  saveUserInfo() {
    // 直接从this.data中获取值而不是重新解构
    const userInfo = this.data.userInfo;
    const username = userInfo.username;
    const phone_number = userInfo.phone_number;
    const email = userInfo.email;
    
    // 输出调试信息
    console.log('保存前检查表单数据:', {
      username,
      phone_number,
      email,
      formHasChanges: this.data.formDebug.hasChanges
    });
    
    const storedUserInfo = wx.getStorageSync('userInfo');
    
    // 验证是否登录
    if (!isUserLoggedIn()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '登录已失效，请重新登录',
        theme: 'error'
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/index?from=edit-profile'
        });
      }, 1500);
      return;
    }
    
    // 简单的表单验证
    if (!username.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '昵称不能为空',
        theme: 'error'
      });
      return;
    }
    
    // 手机号格式验证
    let phoneToSend = null; // 默认为null
    if (phone_number && phone_number.trim() !== '') {
      if (!/^1\d{10}$/.test(phone_number)) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '手机号格式不正确',
          theme: 'error'
        });
        return;
      }
      phoneToSend = phone_number;
    }
    
    // 邮箱格式验证
    let emailToSend = email && email.trim() !== '' ? email : null;
    if (emailToSend && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(emailToSend)) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '邮箱格式不正确',
        theme: 'error'
      });
      return;
    }
    
    // 准备发送的数据 - 使用null而不是空字符串
    const requestData = {
      username: username,
      phone_number: phoneToSend,
      email: emailToSend
    };
    
    // 添加调试日志
    console.log('准备发送的数据:', requestData);
    
    this.setData({ isSaving: true });
    
    // 直接使用wx.request，确保数据正确传输
    const userId = storedUserInfo.id;
    wx.request({
      url: `${BASE_URL}/users/${userId}`,
      method: 'PUT',
      data: requestData,
      header: {
        'content-type': 'application/json',
        'user-id': userId,
        'user-type': 'client'
      },
      success: (res) => {
        console.log('更新用户信息响应:', res);
        
        if (res.statusCode >= 200 && res.statusCode < 300 && res.data.success) {
          // 更新本地存储的用户信息
          const newUserInfo = {
            ...storedUserInfo,
            username: username,
            phone_number: phoneToSend,
            email: emailToSend
          };
          wx.setStorageSync('userInfo', newUserInfo);
          
          Toast({
            context: this,
            selector: '#t-toast',
            message: '保存成功',
            theme: 'success'
          });
          
          // 延迟返回，让用户看到成功提示
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.data.message || '保存失败',
            theme: 'error'
          });
        }
      },
      fail: (err) => {
        console.error('保存用户信息失败:', err);
        Toast({
          context: this,
          selector: '#t-toast',
          message: err.errMsg || '网络错误，请稍后重试',
          theme: 'error'
        });
      },
      complete: () => {
        this.setData({ isSaving: false });
      }
    });
  },

  /**
   * 处理导航栏高度变化
   */
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  }
}) 