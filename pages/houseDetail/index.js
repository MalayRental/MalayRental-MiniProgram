// const { houseList } = require('../../utils/mock/houses');
const { api } = require('../../utils/request');
const { adaptHouseList, ensureFullAvatarUrl } = require('../../utils/dataAdapter');

Page({
  data: {
    id: null,
    houseInfo: null,
    contactInfo: null,
    isFavorite: false,
    swiperCurrent: 0,
    navBarHeight: 0,
    loading: false,
    error: ''
  },
  
  onLoad(options) {
    try {
      const { id } = options;
      this.setData({ id: id || '' });
      this.fetchHouseDetail(id);
    } catch (error) {
      console.error('onLoad error:', error);
      this.setData({ error: '加载失败，请重试' });
    }
  },
  
  // 从API获取房源详情
  fetchHouseDetail(id) {
    if (!id) {
      this.setData({ 
        error: '无效的房源ID',
        loading: false
      });
      return;
    }

    this.setData({ loading: true, error: '' });
    
    try {
      api.getHouseDetail(id)
        .then(res => {
          if (res.success && res.data) {
            try {
              // 使用适配器处理数据
              const [adaptedHouse] = adaptHouseList([res.data]);
              
              // 确保images是数组且至少有一个元素
              if (!adaptedHouse.images || !Array.isArray(adaptedHouse.images) || adaptedHouse.images.length === 0) {
                adaptedHouse.images = ["https://img.yzcdn.cn/vant/cat.jpeg"];
              }
              
              // 确保图片URL没有undefined或null
              adaptedHouse.images = adaptedHouse.images.filter(img => !!img);
              
              // 如果过滤后没有图片，添加默认图片
              if (adaptedHouse.images.length === 0) {
                adaptedHouse.images = ["https://img.yzcdn.cn/vant/cat.jpeg"];
              }
              
              // 打印原始响应数据和适配后的数据
              console.log('API响应数据：', res.data);
              console.log('适配后的房源信息：', adaptedHouse);
              console.log('图片数组：', adaptedHouse.images);
              
              // 记录浏览历史
              this.recordBrowsingHistory(id);
              
              // 如果有创建者ID，获取联系人信息
              if (adaptedHouse.creatorId) {
                this.fetchContactInfo(adaptedHouse.creatorId, adaptedHouse);
              } else {
                // 没有联系人ID时直接更新UI
                this.setData({ 
                  houseInfo: adaptedHouse,
                  loading: false
                });
                // 检查是否已收藏
                this.checkIsFavorite(id);
              }
            } catch (error) {
              console.error('数据处理错误:', error);
              this.setData({ 
                error: '数据处理错误',
                loading: false
              });
            }
          } else {
            this.setData({ 
              error: '获取房源详情失败',
              loading: false
            });
            
            wx.showToast({
              title: '房源不存在',
              icon: 'error',
              duration: 2000
            });
          }
        })
        .catch(err => {
          console.error('获取房源详情出错：', err);
          this.setData({ 
            error: err.message || '网络错误，请稍后再试',
            loading: false
          });
          
          wx.showToast({
            title: '网络错误',
            icon: 'error',
            duration: 2000
          });
        });
    } catch (error) {
      console.error('fetchHouseDetail执行错误:', error);
      this.setData({ 
        error: '程序错误，请重试',
        loading: false
      });
    }
  },
  
  // 记录浏览历史
  recordBrowsingHistory(propertyId) {
    // 检查用户登录状态
    const userInfo = wx.getStorageSync('userInfo');
    // 只有当用户已登录时才会记录浏览历史
    if (userInfo && userInfo.id) {
      api.addHistory(propertyId)
        .then(res => {
          console.log('记录浏览历史成功:', res);
        })
        .catch(err => {
          console.error('记录浏览历史失败:', err);
        });
    } else {
      console.log('用户未登录，不记录浏览历史');
    }
  },
  
  // 获取联系人信息
  fetchContactInfo(userId, houseInfo) {
    api.getUserById(userId)
      .then(res => {
        if (res.success && res.user) {
          // 保存联系人信息和房源信息
          this.setData({ 
            houseInfo: houseInfo,
            contactInfo: {
              id: userId,
              name: res.user.username || '联系人',
              avatar: ensureFullAvatarUrl(res.user.avatar),
              account: res.user.account || '无账号信息'
            },
            loading: false
          });
          // 检查是否已收藏
          this.checkIsFavorite(this.data.id);
        } else {
          // 联系人信息获取失败，使用默认信息
          this.setData({ 
            houseInfo: houseInfo,
            contactInfo: {
              id: userId,
              name: '联系人',
              avatar: "https://img.yzcdn.cn/vant/cat.jpeg",
              account: '无账号信息'
            },
            loading: false
          });
          // 检查是否已收藏
          this.checkIsFavorite(this.data.id);
        }
      })
      .catch(err => {
        console.error('获取联系人信息失败:', err);
        // 联系人信息获取失败，使用默认信息
        this.setData({ 
          houseInfo: houseInfo,
          contactInfo: {
            id: userId,
            name: '联系人',
            avatar: "https://img.yzcdn.cn/vant/cat.jpeg",
            account: '无账号信息'
          },
          loading: false
        });
        // 检查是否已收藏
        this.checkIsFavorite(this.data.id);
      });
  },
  
  // 检查是否已收藏
  checkIsFavorite(propertyId) {
    if (!propertyId) return;
    
    api.checkIsFavorite(propertyId)
      .then(res => {
        if (res.success) {
          this.setData({ isFavorite: res.data.isFavorite });
        }
      })
      .catch(err => {
        console.error('检查收藏状态失败:', err);
      });
  },
  
  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },
  
  onSwiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current
    });
  },
  
  toggleFavorite() {
    // 用户未登录时提示登录
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 房源ID
    const propertyId = this.data.id;
    if (!propertyId) {
      wx.showToast({
        title: '房源ID无效',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 显示加载中提示
    wx.showLoading({
      title: this.data.isFavorite ? '取消收藏中...' : '添加收藏中...',
      mask: true
    });
    
    // 根据当前状态执行添加或取消收藏
    if (this.data.isFavorite) {
      // 取消收藏
      api.removeFavorite(propertyId)
        .then(res => {
          wx.hideLoading();
          if (res.success) {
            this.setData({ isFavorite: false });
            wx.showToast({
              title: '已取消收藏',
              icon: 'success',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: res.message || '操作失败',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error('取消收藏失败:', err);
          wx.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        });
    } else {
      // 添加收藏
      api.addFavorite(propertyId)
        .then(res => {
          wx.hideLoading();
          if (res.success) {
            this.setData({ isFavorite: true });
            wx.showToast({
              title: '已收藏',
              icon: 'success',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: res.message || '操作失败',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error('添加收藏失败:', err);
          wx.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none',
            duration: 2000
          });
        });
    }
  },
  
  callContact() {
    if (this.data.contactInfo && this.data.contactInfo.account) {
      // 判断账号是否是手机号
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (phoneRegex.test(this.data.contactInfo.account)) {
        // 使用 wx.makePhoneCall 拨打电话
        wx.makePhoneCall({
          phoneNumber: this.data.contactInfo.account,
          success: () => {
            console.log('拨打电话成功');
          },
          fail: (err) => {
            console.error('拨打电话失败:', err);
            wx.showToast({
              title: '拨打电话失败，请重试',
              icon: 'none',
              duration: 2000
            });
          }
        });
      } else {
        wx.showToast({
          title: '联系人账号不是手机号，请通过在线聊天联系',
          icon: 'none',
          duration: 2000
        });
      }
    } else {
      wx.showToast({
        title: '联系人信息不可用',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  contactChat() {
    if (this.data.contactInfo) {
      // 检查用户是否已登录
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || !userInfo.id) {
        wx.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        // 可选：跳转到登录页面
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index?from=houseDetail'
          });
        }, 1500);
        return;
      }
      
      const staffId = this.data.contactInfo.id;
      const userName = this.data.contactInfo.name;
      
      // 显示加载提示
      wx.showLoading({
        title: '正在创建会话...',
        mask: true
      });
      
      // 设置请求超时
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('请求超时'));
        }, 15000); // 15秒超时
      });
      //封装title变量 进行监听事件
      const initTitle=this.data.houseInfo.title;
      // 尝试创建会话
      const initialMessage = `[CARD][WANT][${this.data.id}]`;
      // 将API请求和超时Promise一起处理
      Promise.race([
        api.createConversation(staffId, initialMessage),
        timeoutPromise
      ])
        .then(res => {
          wx.hideLoading();
          
          if (res.success && res.data) {
            console.log('创建会话成功：', res.data);
           
            
            // 确保res.data.conversationId存在
            const conversationId = res.data.conversationId;
            if (!conversationId) {
              console.error('创建会话成功但未返回会话ID');
              wx.showToast({
                title: '创建会话失败，请稍后再试',
                icon: 'none',
                duration: 2000
              });
              return;
            }
            // 新增：会话创建成功后再发一条文本消息
            const houseTitle = this.data.houseInfo.title;
            const textMsg = `您好，我对"${houseTitle}"很感兴趣可以了解更多信息吗?`;
            api.sendMessage(conversationId, textMsg);
            // 成功创建会话后，跳转到聊天页面
            wx.navigateTo({
              url: `/pages/message/chat?id=${conversationId}&name=${userName}`
            });
          } else {
            console.error('创建会话失败：', res);
            
            // 显示创建会话失败的提示
            wx.showToast({
              title: '创建会话失败，请稍后再试',
              icon: 'none',
              duration: 2000
            });
          }
        })
        .catch(err => {
          wx.hideLoading();
          console.error('创建会话错误：', err);
          
          // 显示创建会话失败的提示
          const errorMsg = err.message === '请求超时' 
            ? '创建会话超时，请检查网络后重试' 
            : '网络错误，创建会话失败';
          
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
        });
    } else {
      wx.showToast({
        title: '联系人信息不可用',
        icon: 'none'
      });
    }
  },
  
  makeAppointment() {
    wx.showToast({
      title: '预约功能开发中',
      icon: 'none'
    });
  },
  
  // 重试获取房源详情
  retryFetchHouseDetail() {
    this.fetchHouseDetail(this.data.id);
  }
}); 