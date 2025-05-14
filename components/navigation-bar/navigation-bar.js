const app = getApp()

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: '马来租房'
    },
    background: {
      type: String,
      value: '#FFF'
    },
    color: {
      type: String,
      value: '#000'
    },
    back: {
      type: Boolean,
      value: false
    },
    loading: {
      type: Boolean,
      value: false
    },
    homeButton: {
      type: Boolean,
      value: false,
    },
    animated: {
      // 显示隐藏的时候opacity动画效果
      type: Boolean,
      value: true
    },
    show: {
      // 显示隐藏导航，隐藏的时候navigation-bar的高度占位还在
      type: Boolean,
      value: true,
      observer: '_showChange'
    },
    // back为true的时候，返回的页面深度
    delta: {
      type: Number,
      value: 1
    },
    extHeight: {
      type: Number,
      value: 0
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    displayStyle: '',
    statusBarHeight: 0,
    navHeight: 0,
    capsuleHeight: 0,
    capsuleWidth: 0,
    navRight: 0
  },
  lifetimes: {
    attached() {
      // 获取状态栏高度
      const { statusBarHeight } = app.system || wx.getSystemInfoSync();
      // 获取胶囊按钮位置信息
      const { height, top, right, width } = app.menu || wx.getMenuButtonBoundingClientRect();
      // 计算导航栏高度 (胶囊高度 + 状态栏到胶囊的距离 * 2)
      const navHeight = (top - statusBarHeight) * 2 + height;
      
      this.setData({
        statusBarHeight,
        navHeight,
        capsuleHeight: height,
        capsuleWidth: width,
        navRight: app.system?.windowWidth ? app.system.windowWidth - right : 0
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _showChange(show) {
      const animated = this.data.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${show ? '1' : '0'
          };transition:opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      this.setData({
        displayStyle
      })
    },
    
    // 返回上一页
    navigateBack() {
        wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({
            url: '/pages/home/index'
        })
      }
      });
      this.triggerEvent('back', { delta: 1 }, {})
    }
  },
})
