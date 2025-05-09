// 导入API模块
const { api, getCurrentUserId, BASE_URL, isUserLoggedIn } = require('../../utils/request');

// 从API URL中提取基础服务器URL
const SERVER_URL = BASE_URL.replace('/api', '');

Page({
  data: {
    chatId: '',
    chatName: '',
    messages: [
      {
        id: 1,
        isSelf: true,
        isImage: false,
        isCard: true, // 新增卡片类型标识
        cardData: {   // 卡片数据
          title: "标题",
          desc: "描述文字",
          imageUrl: "图片URL",
          link: "跳转链接"
        },
        time: "12:00"
      }
     ],
   
    inputValue: '',
    navBarHeight: 0,
    loading: false,
    error: '',
    sending: false,
    currentUserId: '', // 添加当前用户ID
    refreshTimer: null, // 定时刷新的定时器
    lastMessageId: '', // 记录最后一条消息ID，用于判断是否有新消息
    isLoggedIn: false ,// 添加登录状态标记
 

 
    
    

  },
  
  onLoad(options) {
    const { id, name } = options;
    
    // 检查用户是否已登录
    const loggedIn = isUserLoggedIn();
    this.setData({
      chatId: id,
      chatName: name || '聊天',
      currentUserId: getCurrentUserId(), // 设置当前用户ID
      isLoggedIn: loggedIn // 设置登录状态
    });
    
    // 如果用户未登录，提示用户登录
    if (!loggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '您需要登录后才能使用在线聊天功能',
        confirmText: '去登录',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            this.goToLogin();
          } else {
            // 用户取消，返回上一页
            wx.navigateBack();
          }
        }
      });
      return;
    }
    
    // 加载聊天记录
    this.fetchChatMessages();
    
    // 设置定时器，每1.5秒刷新一次消息
    const refreshTimer = setInterval(() => {
      // 确保用户已登录且页面正常
      if (this.data.isLoggedIn) {
        this.fetchChatMessages(true); // 传入true表示静默刷新
      }
    }, 1500);
    
    this.setData({ refreshTimer });
  },
  
  onShow() {
    // 每次显示页面时，重新检查登录状态
    const loggedIn = isUserLoggedIn();
    this.setData({ isLoggedIn: loggedIn });
    
    // 如果用户未登录，不执行后续操作
    if (!loggedIn) {
      return;
    }
    
    // 页面显示时，如果定时器不存在，重新创建
    if (!this.data.refreshTimer) {
      const refreshTimer = setInterval(() => {
        this.fetchChatMessages(true); // 传入true表示静默刷新
      }, 1500);
      
      this.setData({ refreshTimer });
    }
    
    // 重新加载消息，确保数据最新
    this.fetchChatMessages();
  },
  
  onHide() {
    // 页面隐藏时清除定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
      this.setData({ refreshTimer: null });
    }
  },
  
  onUnload() {
    // 页面卸载时清除定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
    }
  },
  
  // 获取聊天记录
  fetchChatMessages(silent = false) {
    // 如果不是静默刷新，则显示加载状态
    if (!silent) {
      this.setData({ loading: true, error: '' });
    }
    
    api.getConversationById(this.data.chatId)
      .then(res => {
        if (res.success && res.data) {
          // 后端返回的消息已经按时间排序
          const formattedMessages = res.data.messages.map(msg => {
            // 检查是否为图片消息
            const isImageMsg = msg.content.startsWith('[IMAGE]');
            //检查是否是卡片内容
            const isCardMsg = msg.content.startsWith('[CARD]');
            let cardData = null;
            let imageUrl = '';
            
            if (isImageMsg) {
              // 从消息内容提取图片文件名
              // 格式为[IMAGE]filename.jpg
              const imageFilename = msg.content.substring(7); // 去掉[IMAGE]前缀
              // 构建完整的图片URL - 使用完整的绝对URL路径
              imageUrl = `${SERVER_URL}/uploads/chat/${imageFilename}`;
            }else if (isCardMsg) {
              // 卡片消息处理
              try {
    
                // 假设卡片消息格式为 [CARD]{JSON数据}
                const cardJson = msg.content.substring(6); // 去掉[CARD]前缀
                cardData =JSON.parse(cardJson);
                console.log(cardData);
                console.log(msg.content);
              } catch (e) {
                console.error('解析卡片消息失败:', e);
              }
            }
            
            return {
              id: msg.id,
              content: msg.content,
              time: this.formatMessageTime(msg.timestamp),
              isSelf: msg.isFromMe,
              isImage: isImageMsg,
              imageUrl: imageUrl,
              isCard: isCardMsg, // 新增卡片标识
              cardData: cardData // 卡片数据对象
            };
          });
          
          // 检查是否有新消息
          const hasNewMessages = formattedMessages.length > 0 && 
            (formattedMessages[formattedMessages.length - 1].id !== this.data.lastMessageId);
          
          // 更新最后一条消息ID
          const lastMessageId = formattedMessages.length > 0 ? 
            formattedMessages[formattedMessages.length - 1].id : '';
          
          this.setData({
            messages: formattedMessages,
            loading: false,
            lastMessageId
          });
          
          // 如果有新消息，滚动到底部
          if (hasNewMessages) {
            setTimeout(() => this.scrollToBottom(), 200);
          }
        } else {
          // 只有非静默刷新时才显示错误
          if (!silent) {
            this.setData({
              error: '获取聊天记录失败',
              loading: false
            });
          }
        }
      })
      .catch(err => {
        console.error('获取聊天记录出错：', err);
        // 只有非静默刷新时才显示错误
        if (!silent) {
          this.setData({
            error: err.message || '网络错误，请稍后再试',
            loading: false
          });
        }
      });
  },
  
  // 格式化消息时间显示
  formatMessageTime(timeStr) {
    if (!timeStr) return '';
    
    try {
      const now = new Date();
      const msgTime = new Date(timeStr);
      
      // 如果是今天的消息，只显示时间
      if (now.toDateString() === msgTime.toDateString()) {
        return msgTime.getHours().toString().padStart(2, '0') + ':' + 
              msgTime.getMinutes().toString().padStart(2, '0');
      }
      
      // 如果是昨天的消息
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (yesterday.toDateString() === msgTime.toDateString()) {
        return '昨天 ' + msgTime.getHours().toString().padStart(2, '0') + ':' + 
              msgTime.getMinutes().toString().padStart(2, '0');
      }
      
      // 否则显示完整日期时间
      return `${msgTime.getFullYear()}-${(msgTime.getMonth() + 1).toString().padStart(2, '0')}-${msgTime.getDate().toString().padStart(2, '0')} ${msgTime.getHours().toString().padStart(2, '0')}:${msgTime.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('时间格式化错误:', error);
      return timeStr; // 如果解析出错，返回原始字符串
    }
  },
  
  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },
  
  onReady() {
    this.scrollToBottom();
  },
  
  onScrollToLower() {
    // 已经滚动到底部，不需要额外处理
    console.log('已滚动到底部');
  },
  
  scrollToBottom() {
    wx.createSelectorQuery()
      .select('#message-list')
      .boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.height,
            duration: 300
          });
        }
      })
      .exec();
  },
  
  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  
  // 发送消息
  sendMessage() {
    // 检查用户是否已登录
    if (!this.data.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '您需要登录后才能发送消息',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            this.goToLogin(); 
          }
        }
      });
      return;
    }
    
    const { inputValue, chatId } = this.data;
    
    if (!inputValue.trim()) {
      return; // 不发送空消息
    }
    
    this.setData({ sending: true });

    
    api.sendMessage(chatId, inputValue)
      .then(res => {
        if (res.success && res.data) {
          // 检查是否为图片消息
          const isImageMsg = res.data.content.startsWith('[IMAGE]');
          let imageUrl = '';
          
          if (isImageMsg) {
            // 从消息内容提取图片文件名
            const imageFilename = res.data.content.substring(7); // 去掉[IMAGE]前缀
            // 构建完整的图片URL - 使用完整的绝对URL路径
            imageUrl = `${SERVER_URL}/uploads/chat/${imageFilename}`;
          }
          
          // 添加到消息列表
          const newMessage = {
            id: res.data.id,
            content: res.data.content,
            time: this.formatMessageTime(res.data.timestamp),
            isSelf: true,
            isImage: isImageMsg,
            imageUrl: imageUrl,
          
          };
          const messages = [...this.data.messages, newMessage];
          
          this.setData({
            messages,
            inputValue: '', // 清空输入框
            sending: false,
            lastMessageId: newMessage.id // 更新最后一条消息ID
          });
          
          // 滚动到最新消息
          setTimeout(() => this.scrollToBottom(), 200);
        } else {
          wx.showToast({
            title: res.message || '发送失败',
            icon: 'none'
          });
          this.setData({ sending: false });
        }
      })
      .catch(err => {
        console.error('发送消息出错：', err);
        wx.showToast({
          title: err.message || '网络错误，请稍后重试',
          icon: 'none'
        });
        this.setData({ sending: false });
      });
  },

  //发送卡片、
  sendCardMessage(cardData) {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const cardContent = `[CARD]${JSON.stringify(cardData)}`; //将卡片内容序列化
    this.setData({ sending: true });

    api.sendMessage(this.data.chatId, cardContent)
      .then(res => {
        if (res.success) {
          const newMessage = {
            id: res.data.id,
            content: cardContent, // 原始内容
            time: this.formatTime(new Date()),
            isSelf: true,
            isCard: true,
            cardData: cardData // 结构化数据
          };
          this.addNewMessage(newMessage);
        }
      })
      .catch(err => {
        wx.showToast({ title: '发送失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ sending: false });
      });
  },
 

  
  
  // 图片加载错误处理
  onImageError(e) {
    console.error('图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },
  
  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      return;
    }
    
    wx.previewImage({
      current: url,
      urls: [url]
    });
  },
  
    
    
  
  // 发送图片消息
  sendImageMessage() {
    // 检查用户是否已登录
    if (!this.data.isLoggedIn) {
      wx.showModal({
        title: '请先登录',
        content: '您需要登录后才能发送图片',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            this.goToLogin();
          }
        }
      });
      return;
    }
    
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        
        // 显示上传中提示
        wx.showLoading({
          title: '发送中...',
          mask: true
        });
        
        // 正确的API URL，将type作为查询参数添加，而不是formData
        const uploadUrl = `${SERVER_URL}/api/upload/image?type=chat`;
        console.log('开始上传图片到:', uploadUrl);
        
        // 上传图片到服务器
        wx.uploadFile({
          url: uploadUrl, // 将type参数添加到URL中
          filePath: tempFilePath,
          name: 'image', // 图片字段名
          header: {
            'user-id': getCurrentUserId(),
            'user-type': 'client'
          },
          // formData不再传递type参数
          success: (uploadRes) => {
            console.log('图片上传响应:', uploadRes);
            
            // 解析返回的JSON
            try {
              const result = JSON.parse(uploadRes.data);
              console.log('解析上传响应数据:', result);
              
              // 检查fileName字段
              if (result.success && result.fileName) {
                // 使用服务器返回的fileName
                const fileName = result.fileName;
                // 构建图片消息格式：[IMAGE]filename.jpg
                const imageMessage = `[IMAGE]${fileName}`;
                console.log('构建图片消息:', imageMessage);
                
                // 使用普通消息API发送图片消息
                this.sendImageContentMessage(imageMessage);
              } 
              // 兼容其他格式的返回
              else if (result.success && result.data && result.data.filename) {
                // 图片上传成功，发送图片消息
                // 构建图片消息格式：[IMAGE]filename.jpg
                const imageMessage = `[IMAGE]${result.data.filename}`;
                console.log('构建图片消息:', imageMessage);
                
                // 使用普通消息API发送图片消息
                this.sendImageContentMessage(imageMessage);
              } else {
                console.error('图片上传失败, 服务器返回:', result);
                wx.showToast({
                  title: result.message || '图片发送失败',
                  icon: 'none'
                });
                wx.hideLoading();
              }
            } catch (error) {
              console.error('解析上传响应失败:', error, '原始数据:', uploadRes.data);
              wx.showToast({
                title: '图片发送失败',
                icon: 'none'
              });
              wx.hideLoading();
            }
          },
          fail: (err) => {
            console.error('图片上传请求失败:', err);
            wx.showToast({
              title: '图片上传失败',
              icon: 'none'
            });
            wx.hideLoading();
          }
        });
      }
    });
  },
  
  // 发送图片内容消息
  sendImageContentMessage(imageMessage) {
    api.sendMessage(this.data.chatId, imageMessage)
      .then(res => {
        if (res.success && res.data) {
          // 图片消息发送成功
          const imageFilename = imageMessage.substring(7); // 去掉[IMAGE]前缀
          const imageUrl = `${SERVER_URL}/uploads/chat/${imageFilename}`;
          
          // 添加到消息列表
          const newMessage = {
            id: res.data.id,
            content: res.data.content,
            time: this.formatMessageTime(res.data.timestamp),
            isSelf: true,
            isImage: true,
            imageUrl: imageUrl
          };
          
          const messages = [...this.data.messages, newMessage];
          
          this.setData({
            messages,
            lastMessageId: newMessage.id // 更新最后一条消息ID
          });
          
          // 滚动到最新消息
          setTimeout(() => this.scrollToBottom(), 200);
        } else {
          wx.showToast({
            title: res.message || '图片消息发送失败',
            icon: 'none'
          });
        }
        
        wx.hideLoading();
      })
      .catch(err => {
        console.error('发送图片消息出错：', err);
        wx.showToast({
          title: err.message || '网络错误，请稍后重试',
          icon: 'none'
        });
        wx.hideLoading();
      });
  },
  onCardClick() {
    
    this.sendCardMessage({
      type: "product",
      title: "苹果 AirPods Pro",
      desc: "主动降噪，无线充电",
      imageUrl: "https://example.com/airpods.jpg",
    
      price: "¥1999"
    });
  },
  
  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/index?from=chat'
    });
  }
}); 