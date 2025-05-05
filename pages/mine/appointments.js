const { houseList } = require('../../utils/mock/houses');
const { userInfo } = require('../../utils/mock/user');

Page({
  data: {
    appointments: [],
    navBarHeight: 0
  },
  
  onLoad() {
    // 获取预约列表
    const appointments = userInfo.appointments.map(appointment => {
      const house = houseList.find(h => h.id === appointment.houseId);
      return {
        ...appointment,
        house
      };
    });
    
    this.setData({
      appointments
    });
  },
  
  // 处理导航栏高度变化
  onNavBarHeightChange(e) {
    this.setData({
      navBarHeight: e.detail.height
    });
  },
  
  onHouseClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/houseDetail/index?id=${id}`
    });
  },
  
  getStatusText(status) {
    const statusMap = {
      pending: '待确认',
      confirmed: '已确认',
      canceled: '已取消',
      completed: '已完成'
    };
    return statusMap[status] || '未知状态';
  },
  
  getStatusColor(status) {
    const colorMap = {
      pending: '#FAAD14',
      confirmed: '#52C41A',
      canceled: '#FF4D4F',
      completed: '#1890FF'
    };
    return colorMap[status] || '#888888';
  }
}); 