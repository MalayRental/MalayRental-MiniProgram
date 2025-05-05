Component({
  properties: {
    title: {
      type: String,
      value: '大马租房'
    },
    showBack: {
      type: Boolean,
      value: false
    },
    showHome: {
      type: Boolean,
      value: false
    },
    backgroundColor: {
      type: String,
      value: 'transparent'
    },
    textColor: {
      type: String,
      value: '#000000'
    },
    bgGradient: {
      type: Boolean,
      value: false
    },
    solidGradient: {
      type: Boolean,
      value: false
    },
    backUrl: {
      type: String,
      value: ''
    },
    useTabBack: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    menuButtonHeight: 0,
    menuButtonTop: 0
  },
  
  lifetimes: {
    attached() {
      try {
        // 获取状态栏高度
        const windowInfo = wx.getWindowInfo();
        const statusBarHeight = windowInfo.statusBarHeight;
        
        // 获取胶囊按钮位置信息
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        const menuButtonHeight = menuButtonInfo.height;
        const menuButtonTop = menuButtonInfo.top;
        
        // 计算导航栏高度：(胶囊top-状态栏高度)*2 + 胶囊高度 + 额外边距
        const extraPadding = 6; // 额外的底部边距(px)
        const navBarHeight = (menuButtonTop - statusBarHeight) * 2 + menuButtonHeight + extraPadding;
        
        this.setData({
          statusBarHeight,
          navBarHeight,
          menuButtonHeight,
          menuButtonTop
        });
        
        // 通知页面导航栏高度
        const totalHeight = statusBarHeight + navBarHeight;
        this.triggerEvent('heightChange', { height: totalHeight });
        
        console.log('导航栏计算信息:', {
          statusBarHeight,
          menuButtonTop,
          menuButtonHeight,
          navBarHeight,
          totalHeight
        });
      } catch (e) {
        console.error('获取设备信息失败', e);
        // 降级处理，使用旧API
        this.getFallbackSystemInfo();
      }
    }
  },
  
  methods: {
    // 降级处理，使用旧API
    getFallbackSystemInfo() {
      try {
        // 尝试使用其他新API获取信息
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : null;
        const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : null;
        
        let statusBarHeight = 20; // 默认值
        if (windowInfo && windowInfo.statusBarHeight) {
          statusBarHeight = windowInfo.statusBarHeight;
        }
        
        // 根据系统类型设置导航栏高度
        const isIOS = deviceInfo && deviceInfo.platform && deviceInfo.platform.toLowerCase() === 'ios';
        const navBarHeight = isIOS ? 44 : 48;
        
        this.setData({
          statusBarHeight,
          navBarHeight
        });
        
        const totalHeight = statusBarHeight + navBarHeight;
        this.triggerEvent('heightChange', { height: totalHeight });
      } catch (e) {
        console.error('降级获取设备信息也失败', e);
        // 提供默认值
        this.setData({
          statusBarHeight: 20,
          navBarHeight: 48
        });
        this.triggerEvent('heightChange', { height: 68 });
      }
    },
    
    goBack() {
      if (this.data.showBack) {
        // 使用自定义返回URL
        if (this.data.backUrl) {
          // 判断是否需要使用switchTab
          if (this.data.useTabBack) {
            wx.switchTab({
              url: this.data.backUrl
            });
          } else {
            wx.navigateTo({
              url: this.data.backUrl
            });
          }
        } else {
          // 默认返回行为
          wx.navigateBack({
            delta: 1,
            fail: () => {
              wx.switchTab({
                url: '/pages/home/index'
              });
            }
          });
        }
      }
    },
    
    goHome() {
      if (this.data.showHome) {
        wx.switchTab({
          url: '/pages/home/index'
        });
      }
    }
  }
}) 