const app = getApp()
const { chatService } = require('../../api/service/index');
const userUtils = require('../../utils/userUtils');
const { getImageUrl } = require('../../api/service/imageGetService');
const { BASE_URL } = require('../../api/api');

function formatHouseCoverUrl(image) {
  if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image;
  }
  return `${BASE_URL}/api/images/houseCover/${image}`;
}

Page({
  data: {
    userId: null,
    inputValue: '', // 输入框的值
    scrollIntoView: '', // 滚动定位的消息ID
    contact: {
      avatar: '',
      name: '',
      userId: '',
      online: false
    },
    navBarHeight: 0, // 导航栏高度
    messageListStyle: '', // 消息列表样式
    messages: [],
    wantHouseCard: null // 房源卡片信息
  },

  onLoad: function(options) {
    const { id, staffAvatar, staffStatus, staffName, staffId, houseId, coverImage, houseName, price, area } = options;
    const contact = {
      avatar: getImageUrl('avatar', decodeURIComponent(staffAvatar || '')),
      name: decodeURIComponent(staffName || ''),
      userId: staffId || '',
      online: staffStatus === 'online'
    };
    let wantHouseCard = null;
    if (houseId && coverImage && houseName && price && area) {
      wantHouseCard = {
        houseId,
        coverImage: formatHouseCoverUrl(decodeURIComponent(coverImage)),
        houseName: decodeURIComponent(houseName),
        price,
        area: decodeURIComponent(area)
      };
    }
    this.setData({
      userId: id,
      contact,
      wantHouseCard
    });
    // 已读所有消息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo && userInfo.userId && id) {
      chatService.readChatMessages(userInfo.userId, id);
    }
    // 获取消息列表
    this.fetchMessages();
    this.getNavBarHeight();
    this.scrollToBottom();
  },

  fetchMessages: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.userId || !this.data.userId) {
      this.setData({ messages: [] });
      return;
    }
    chatService.getAllMessages(userInfo.userId, this.data.userId).then(res => {
      if (res.code === 200 && Array.isArray(res.data)) {
        const messages = res.data.map(item => {
          // 处理基本消息属性
          const messageObj = {
            id: item.messageId,
            time: this.formatChatTime(item.createTime),
            isMine: item.senderId === userInfo.userId,
            avatar: item.senderId === userInfo.userId
              ? getImageUrl('avatar', userInfo.avatar)
              : this.data.contact.avatar
          };

          // 解析卡片消息
          if (item.messageType === 'Card') {
            if (item.content.startsWith('[WantHouse]')) {
              try {
                const jsonStr = item.content.substring('[WantHouse]'.length);
                const cardData = JSON.parse(jsonStr);
                // 处理封面图片路径
                if (cardData.coverImage) {
                  cardData.coverImage = getImageUrl('houseCover', cardData.coverImage);
                }
                messageObj.cardData = cardData;
                messageObj.cardType = 'WantHouse';
                messageObj.content = ''; // 卡片消息不需要文本内容
              } catch (e) {
                console.error('解析房源卡片失败:', e);
                messageObj.content = '[房源卡片]';
              }
            } else {
              messageObj.content = '[卡片消息]';
            }
          } else if (item.messageType === 'Image') {
            messageObj.content = '[图片消息]';
          } else {
            messageObj.content = item.content || '';
          }
          
          return messageObj;
        });
        this.setData({ messages }, () => this.scrollToBottom());
      } else {
        this.setData({ messages: [] });
      }
    }).catch(() => {
      this.setData({ messages: [] });
    });
  },

  // 聊天时间格式化
  formatChatTime: function(timeStr) {
    if (!timeStr) return '';
    const now = new Date();
    const date = new Date(timeStr.replace(/-/g, '/'));
    const nowY = now.getFullYear();
    const nowM = now.getMonth();
    const nowD = now.getDate();
    const dateY = date.getFullYear();
    const dateM = date.getMonth();
    const dateD = date.getDate();
    const pad = n => n < 10 ? '0' + n : n;
    const hm = pad(date.getHours()) + ':' + pad(date.getMinutes());
    if (nowY === dateY && nowM === dateM && nowD === dateD) {
      return `今天 ${hm}`;
    }
    const yesterday = new Date(now);
    yesterday.setDate(nowD - 1);
    if (dateY === yesterday.getFullYear() && dateM === yesterday.getMonth() && dateD === yesterday.getDate()) {
      return `昨天 ${hm}`;
    }
    const beforeYesterday = new Date(now);
    beforeYesterday.setDate(nowD - 2);
    if (dateY === beforeYesterday.getFullYear() && dateM === beforeYesterday.getMonth() && dateD === beforeYesterday.getDate()) {
      return `前天 ${hm}`;
    }
    if (nowY === dateY) {
      return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hm}`;
    }
    return `${dateY}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hm}`;
  },

  onReady: function() {
    this.scrollToBottom();
    this.adjustMessageListHeight();
  },
  
  // 获取导航栏高度
  getNavBarHeight: function() {
    const query = wx.createSelectorQuery();
    query.select('#navbar').boundingClientRect();
    query.exec(res => {
      if (res && res[0]) {
        this.setData({
          navBarHeight: res[0].height
        });
        
        // 动态调整消息列表高度
        this.adjustMessageListHeight();
      } else {
        // 备用方案：手动计算
        const systemInfo = wx.getSystemInfoSync();
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        
        // 状态栏高度
        const statusBarHeight = systemInfo.statusBarHeight;
        // 导航栏高度 = 状态栏高度 + 胶囊按钮到状态栏的距离 * 2 + 胶囊高度
        const navBarHeight = statusBarHeight + (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
        
        this.setData({
          navBarHeight
        });
        
        // 动态调整消息列表高度
        this.adjustMessageListHeight();
      }
    });
  },
  
  // 调整消息列表高度
  adjustMessageListHeight: function() {
    const systemInfo = wx.getSystemInfoSync();
    // 不再减去输入框高度，因为输入框现在固定在底部
    const availableHeight = systemInfo.windowHeight - this.data.navBarHeight - 128;
    this.setData({
      messageListStyle: `max-height: ${availableHeight}px;`
    });
  },

  // 发送消息
  sendMessage: function() {
    if (!this.data.inputValue.trim()) return;
    
    const newMessage = {
      id: 'm' + (this.data.messages.length + 1),
      content: this.data.inputValue,
      time: this.getCurrentTime(),
      isMine: true,
      avatar: '/assets/images/user-avatar.jpg'
    };
    
    const messages = [...this.data.messages, newMessage];
    
    this.setData({
      messages,
      inputValue: ''
    }, () => {
      // 发送消息后滚动到底部
      this.scrollToBottom();
    });
  },

  // 处理输入框内容变化
  handleInputChange: function(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 获取当前时间
  getCurrentTime: function() {
    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
  },

  // 滚动到底部
  scrollToBottom: function() {
    if (this.data.messages.length > 0) {
      const lastMessageId = this.data.messages[this.data.messages.length - 1].id;
      this.setData({
        scrollIntoView: lastMessageId
      });
    }
  },

  // 关闭房源卡片
  closeWantHouseCard: function() {
    this.setData({ wantHouseCard: null });
  },

  // 查看房源详情
  viewHouseDetail: function(e) {
    const houseId = e.currentTarget.dataset.houseid;
    if (houseId) {
      wx.navigateTo({
        url: `/pages/houseDetail/index?id=${houseId}`
      });
    }
  },

  // 发送房源卡片
  sendWantHouseCard: function() {
    const card = this.data.wantHouseCard;
    if (!card) return;
    
    const cardData = {
      houseId: card.houseId,
      coverImage: card.coverImage,
      houseName: card.houseName,
      price: card.price,
      area: card.area
    };
    
    const jsonStr = JSON.stringify(cardData);
    const newMessage = {
      id: 'm' + (this.data.messages.length + 1),
      cardData: cardData,
      cardType: 'WantHouse',
      content: `[WantHouse]${jsonStr}`, // 保持原消息格式，方便后台处理
      time: this.getCurrentTime(),
      isMine: true,
      avatar: '/assets/images/user-avatar.jpg'
    };
    
    const messages = [...this.data.messages, newMessage];
    this.setData({
      messages,
      wantHouseCard: null
    }, () => {
      this.scrollToBottom();
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