// 封装请求方法
const BASE_URL = 'https://web.lostzone.cn:7957/api'; // 根据实际后端地址修改

// 获取当前登录用户的ID
const getCurrentUserId = () => {
  try {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.id) {
      return userInfo.id;
    }
    // 如果没有有效的用户ID，返回null
    return null;
  } catch (error) {
    console.error('获取当前用户ID失败:', error);
    return null; // 出错时返回null
  }
};

// 检查用户是否已登录
const isUserLoggedIn = () => {
  try {
    const userInfo = wx.getStorageSync('userInfo');
    // 检查userInfo是否存在且包含有效的用户ID
    return !!(userInfo && userInfo.id);
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
};

const request = (url, method = 'GET', data = {}, needUserId = false, userType = 'client') => {
  return new Promise((resolve, reject) => {
    // 默认请求头
    const header = {
      'content-type': 'application/json'
    };
    
    // 如果需要添加用户ID
    if (needUserId) {
      const userId = getCurrentUserId();
      
      // 如果需要用户ID但没有获取到有效的用户ID，则直接拒绝请求
      if (!userId) {
        return reject({
          statusCode: 401,
          message: '未登录或无效的用户ID'
        });
      }
      
      header['user-id'] = userId;
      header['user-type'] = userType; // 添加用户类型，默认为client(小程序用户)
    }
    
    // 检查用户是否登录
    if (needUserId && !isUserLoggedIn()) {
      console.warn('用户未登录，某些功能可能无法正常使用');
    }
    
    // 处理数据，将空字符串转为null
    const processedData = {};
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(key => {
        // 如果是phone_number字段且值为空字符串，则设置为null
        if (key === 'phone_number' && data[key] === '') {
          processedData[key] = null;
        } else {
          processedData[key] = data[key];
        }
      });
    } else {
      Object.assign(processedData, data);
    }
    
    // 打印处理后的数据用于调试
    console.log('发送请求数据:', processedData);
    
    // 设置请求超时时间 (10秒)
    const timeout = 10000;
    const requestTask = wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data: processedData,
      header: header,
      timeout: timeout, // 设置超时时间
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          // 请求成功但状态码异常
          const errorObj = {
            statusCode: res.statusCode,
            message: '请求失败',
            data: res.data
          };
          
          // 优先使用服务器返回的错误信息
          if (res.data) {
            if (typeof res.data === 'string') {
              errorObj.message = res.data;
            } else if (res.data.message) {
              errorObj.message = res.data.message;
            } else if (res.data.error) {
              errorObj.message = res.data.error;
            }
          }
          
          reject(errorObj);
        }
      },
      fail: (err) => {
        // 请求失败
        const errorObj = {
          statusCode: -1,
          message: '网络错误，请检查网络连接',
          originalError: err
        };
        
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorObj.message = '请求超时，请稍后重试';
          } else if (err.errMsg.includes('fail')) {
            errorObj.message = '网络请求失败，请检查网络连接';
          }
        }
        
        reject(errorObj);
      }
    });
    
    // 返回请求任务，便于中断请求
    return requestTask;
  });
};

// 封装常用请求方法
const api = {
  // 获取所有房源
  getHouses: () => {
    return request('/properties');
  },
  
  // 获取房源详情
  getHouseDetail: (id) => {
    return request(`/properties/${id}`);
  },
  
  // 获取所有区域
  getAllAreas: () => {
    return request('/areas');
  },
  
  // 获取用户详情
  getUserById: (id) => {
    return request(`/users/${id}`);
  },

  // 获取会话列表 - 添加用户ID头，指定用户类型为client
  getConversations: () => {
    return request('/messages/conversations', 'GET', {}, true, 'client');
  },

  // 获取会话详情 - 添加用户ID头，指定用户类型为client
  getConversationById: (id) => {
    return request(`/messages/conversations/${id}`, 'GET', {}, true, 'client');
  },

  // 发送消息 - 添加用户ID头，指定用户类型为client
  sendMessage: (conversationId, content) => {
    return request('/messages/send', 'POST', { conversationId, content }, true, 'client');
  },

  // 创建新会话 - 添加用户ID头，指定用户类型为client
  createConversation: (staffId, initialMessage) => {
    // 小程序用户创建会话时，当前用户是user_id，目标联系人是staff_id
    // 后端API期望的参数名是targetId，而不是staffId
    return request('/messages/conversations', 'POST', { targetId: staffId, initialMessage }, true, 'client');
  },

  // 删除会话 - 添加用户ID头，指定用户类型为client
  deleteConversation: (id) => {
    return request(`/messages/conversations/${id}`, 'DELETE', {}, true, 'client');
  },
  
  // 添加收藏 - 添加用户ID头
  addFavorite: (propertyId) => {
    return request('/favorites', 'POST', { propertyId }, true, 'client');
  },
  
  // 取消收藏 - 添加用户ID头
  removeFavorite: (propertyId) => {
    return request(`/favorites/${propertyId}`, 'DELETE', {}, true, 'client');
  },
  
  // 获取收藏列表 - 添加用户ID头
  getFavorites: () => {
    return request('/favorites', 'GET', {}, true, 'client');
  },
  
  // 检查是否已收藏 - 添加用户ID头
  checkIsFavorite: (propertyId) => {
    return request(`/favorites/check/${propertyId}`, 'GET', {}, true, 'client');
  },
  
  // 添加浏览历史 - 添加用户ID头
  addHistory: (propertyId) => {
    return request('/history', 'POST', { propertyId }, true, 'client');
  },
  
  // 获取浏览历史 - 添加用户ID头
  getHistory: (limit = 20) => {
    return request(`/history?limit=${limit}`, 'GET', {}, true, 'client');
  },
  
  // 清空浏览历史 - 添加用户ID头
  clearHistory: () => {
    return request('/history', 'DELETE', {}, true, 'client');
  },
  
  // 删除单条浏览记录 - 添加用户ID头
  removeHistoryItem: (propertyId) => {
    return request(`/history/${propertyId}`, 'DELETE', {}, true, 'client');
  },
  
  // 更新用户信息（包括微信用户信息）
  updateUserInfo: (data) => {
    // 获取当前登录用户的ID
    const userId = getCurrentUserId();
    if (!userId) {
      return Promise.reject({
        statusCode: 401,
        message: '未登录或无效的用户ID'
      });
    }
    
    // 处理数据，确保phone_number不是空字符串
    const processedData = { ...data };
    if (processedData.phone_number === '') {
      processedData.phone_number = null;
    }
    
    console.log('发送用户更新请求:', {
      userId,
      data: processedData
    });
    
    // 直接使用用户ID作为路径参数
    return request(`/users/${userId}`, 'PUT', processedData, true, 'client');
  },
  
  // 检查微信账号是否已绑定
  checkWxAccount: (code) => {
    return request('/users/check-wx-account', 'POST', { code });
  },
  
  // 用户注册或登录 (使用微信)
  autoRegisterWithWx: (code) => {
    return request('/users/auto-register-wx', 'POST', { code });
  }
};

module.exports = {
  request,
  api,
  BASE_URL,
  getCurrentUserId,
  isUserLoggedIn
}; 