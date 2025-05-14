const app = getApp()

Page({
  data: {
    userCard: {
      avatar: '/assets/images/user-avatar.jpg',
      name: '林小明',
      gender: '男',
      phone: '13512345678',
      email: 'linxiaoming@example.com',
      school: '马来西亚国际大学'
    },
    isEditing: false, // 是否处于编辑状态
    editData: {} // 编辑的临时数据
  },

  onLoad: function() {
    // 初始化编辑数据
    this.setData({
      editData: { ...this.data.userCard }
    });
  },

  // 切换编辑状态
  toggleEdit: function() {
    if (this.data.isEditing) {
      // 保存编辑
      this.setData({
        userCard: { ...this.data.editData },
        isEditing: false
      });
      
      // 这里应该调用API保存数据
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
    } else {
      // 进入编辑状态
      this.setData({
        isEditing: true
      });
    }
  },

  // 处理输入变化
  handleInputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`editData.${field}`]: value
    });
  },

  // 选择性别
  handleGenderChange: function(e) {
    this.setData({
      'editData.gender': e.detail.value
    });
  },

  // 取消编辑
  cancelEdit: function() {
    this.setData({
      editData: { ...this.data.userCard },
      isEditing: false
    });
  },
  
  // 上传头像
  uploadAvatar: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          'editData.avatar': tempFilePaths[0]
        });
        
        // 这里应该调用API上传头像
      }
    });
  }
}) 