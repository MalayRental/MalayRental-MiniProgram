熟悉我的项目
你需要帮我完成一个租房小程序，要求美观简洁流畅
1. 主页面组件
1.1 自定义顶部导航栏
自定义顶部导航栏用于显示当前页面的名称，我们使用自定义导航栏是因为微信小程序原生的顶部导航栏无法更改背景，但是我们的小程序需要一个沉浸的内容区域与顶部一体的渐变，故使用自定义顶部导航栏。
使用自定义顶部导航栏需要注意，我们需要将自定义导航栏的标题水平对齐微信小程序的胶囊工具栏，你需要学习下面完美适配微信小程序胶囊对齐的方案：
// app.js
App({
  globalData: {},
  onLaunch: function() {
    //获取系统信息
    wx.getSystemInfo({
      success: res => {
        this.system = res
      }
    })
    //获取胶囊信息
    this.menu = wx.getMenuButtonBoundingClientRect()
    //打印数据
    console.log('系统信息', this.system)
    console.log('胶囊信息', this.menu)
  }
})

// component.js
const app = getApp()
 
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //导航栏颜色
    navColor: {
      type: String,
      value: '#fff'
    }
  },
 
  /**
   * 组件的初始数据
   */
  data: {
    s: app.system.statusBarHeight, //状态栏高度
    n: (app.menu.top - app.system.statusBarHeight) * 2 + app.menu.height, //导航栏高度
    h: app.menu.height //胶囊高度
  }
})

// component.wxml
<cover-view class='nav_box' style='background:{{navColor}}'>
  <cover-view style='height:{{s}}px' />
  <cover-view class='navBar' style='height:{{n}}px'>
    <cover-view class='content' style='height:{{h}}px'>
 
      <!-- 导航自定义内容 -->
      <!-- 1. 插槽 可在使用页面插入所需内容 -->
      <slot></slot>
 
      <!-- 2. 选择渲染 可在js页面 设置渲染type属性 不同场景传不同值 -->
      <block wx:if='{{type == 0}}'>
        导航一
      </block>
      <block wx:if='{{type == 1}}'>
        导航二
      </block>
      <block  wx:else>
        导航三
      </block>
 
    </cover-view>
  </cover-view>
</cover-view>
<view style='height:{{s+n}}px' /> <!-- 注：占位用 -->

1.2 底部导航栏
底部导航栏用于导航不同的页面，包含三个主要页面: 首页 消息 我的
使用上方icon，下方文字的形式，图标有选中与不选中两种状态

2. 首页
路径：/pages/home/index.wxml
首页的内容区域：轮播图+筛选器+房源列表

2.1 筛选器内容
位置：下拉包含全部位置和其余多个位置
户型：有多个子类，分别为 居室（不限、1居、2居、3居+）、房型亮点（双卫生间、loft/复式、不看开间、开间）、朝向（东、西、南、北、南北）、面积（≤40m²，40-60m²，60-80m²、80-100m²、100-120m²、≥120m²）
租金：不限、≤1000RM、1000-1500RM、1500-2000RM、2000-2500RM、2500-3000RM、≥3000RM
排序：推荐排序、最新发布、价格（从低到高）、价格（从高到低）、面积（从小到大）、面积（从大到小）

2.2 房源条目样式
房源条目需要展示以下内容：
封面 coverImage
房源名称 houseName
区域 area
价格 price
朝向 orientation
面积 proportion
具体的呈现方式你需要自己规划，要求条目美观，数据直观

3. 房源详情页面
路径 /pages/houseDetail/index
此页面不显示底部导航栏，改为底部操作栏，在自定义顶部导航栏加入返回按钮
房源详细页面包含内容：
顶部轮播图
房源名称
房源价格
所在区域
朝向
面积
标签
详细地址
可入住时间
付款方式（月付、季付、年付）
附加设施
所在小区
详细介绍（文字）
中介费
上传时间
最后更新
你需要对以上信息进行分类，并考虑如何直观的展示数据，页面也要符合大局，美观

底部操作栏为：收藏 在线聊 电话聊 三个按钮
点击在线聊跳转到对应用户的聊天页面

4. 消息
路径：/pages/chatList/index
消息页面的内容区域：搜索框+会话列表

4.1 搜索框支持搜索聊天目标用户的用户名

4.2 会话条目样式
需要包含以下内容：
头像 avatar
名称 userName
最新消息内容 lastMessage
最新消息时间 lastMessageTime

5. 聊天页面
路径：/pages/chatOnline/index
此页面不显示底部导航栏，改为底部输入栏，在自定义顶部导航栏加入返回按钮
内容区域顶部为对方员工信息，包含：
头像 avatar
用户名称
用户ID userId
在线状态

页面中间为消息区域，使用消息气泡完成，对方在左，我在右，自动滚动到最新消息

6. 我的页面
路径 /pages/mine/index
我的页面的内容区域：顶部的用户信息，其次是一个收藏列表和历史浏览二合一的横向按钮组，下方为多个条目：

6.1 内容区域顶部用户信息
包含：用户头像，用户名，用户手机号
6.2 内容区域下方条目包括
我的名片 (pages/businessCard/index)
账号资料 (pages/accountInfo/index)
与我们合作 (pages/collaboration/index)
意见反馈 (pages/feedback/index)
隐私政策 (pages/policy/index)
关于马来租房 (pages/about/index)
6.2.1 我的名片 (pages/businessCard/index)
包含以下内容：
头像
姓名
性别
手机号
电子邮箱
学校

其他页面你可以自行设计





