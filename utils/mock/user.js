const userInfo = {
  id: 12345,
  name: '张三',
  avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
  phone: '+60123456789',
  email: 'zhangsan@example.com',
  favorites: [1, 3, 4], // 收藏的房源ID
  history: [1, 2, 5, 3], // 浏览历史房源ID
  appointments: [
    {
      id: 1001,
      houseId: 2,
      date: '2024-05-15',
      time: '15:00',
      status: 'pending' // pending, confirmed, canceled, completed
    },
    {
      id: 1002,
      houseId: 4,
      date: '2024-05-20',
      time: '10:00',
      status: 'confirmed'
    }
  ]
};

module.exports = {
  userInfo
}; 