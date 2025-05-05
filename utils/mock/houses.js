const houseList = [
  {
    id: 1,
    title: '吉隆坡市中心高档公寓',
    price: 1500,
    currency: 'RM',
    area: 80,
    room: 2,
    address: '吉隆坡 KLCC Twin Tower附近',
    tags: ['拎包入住', '近地铁', '精装修'],
    images: [
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v25b7c5ebd655f4deca37754f1eb577102.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v25b7c5ebd655f4deca37754f1eb577103.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v25b7c5ebd655f4deca37754f1eb577104.jpg',
    ],
    description: '位于吉隆坡市中心，交通便利，周边设施齐全，生活便利。公寓内部装修精美，家具家电齐全，拎包即可入住。',
    facilities: ['WiFi', '空调', '洗衣机', '冰箱', '电视', '热水器', '游泳池', '健身房'],
    landlord: {
      name: '王先生',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      phone: '+60123456789'
    }
  },
  {
    id: 2,
    title: '槟城Georgetown历史区独栋别墅',
    price: 2800,
    currency: 'RM',
    area: 150,
    room: 3,
    address: '槟城 Georgetown历史区',
    tags: ['花园', '停车位', '私家泳池'],
    images: [
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2c6fa975db9e64f0ab1b8e8240d154631.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2c6fa975db9e64f0ab1b8e8240d154632.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2c6fa975db9e64f0ab1b8e8240d154633.jpg',
    ],
    description: '位于槟城历史区的独栋别墅，建筑风格独特，环境安静，配备私家花园和游泳池，适合家庭居住。',
    facilities: ['WiFi', '空调', '洗衣机', '冰箱', '电视', '热水器', '花园', '泳池', '停车位'],
    landlord: {
      name: '李女士',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      phone: '+60198765432'
    }
  },
  {
    id: 3,
    title: '新山Johor Bahru两室一厅公寓',
    price: 1200,
    currency: 'RM',
    area: 70,
    room: 2,
    address: '新山 Johor Bahru市区',
    tags: ['近新加坡', '安全小区', '家电齐全'],
    images: [
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2db3de7efdb6f4f2d9ea5c03a5d490451.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2db3de7efdb6f4f2d9ea5c03a5d490452.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2db3de7efdb6f4f2d9ea5c03a5d490453.jpg',
    ],
    description: '位于新山市区，靠近新加坡，交通便利，小区安全有保安，适合在新加坡工作的人士居住。',
    facilities: ['WiFi', '空调', '洗衣机', '冰箱', '电视', '热水器', '停车位', '门禁系统'],
    landlord: {
      name: '张先生',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      phone: '+60167890123'
    }
  },
  {
    id: 4,
    title: '兰卡威海滨度假别墅',
    price: 3500,
    currency: 'RM',
    area: 200,
    room: 4,
    address: '兰卡威 Pantai Cenang海滩附近',
    tags: ['海景', '度假风', '豪华装修'],
    images: [
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v21fcbdc5e20ab42c196c3b530cde21d41.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v21fcbdc5e20ab42c196c3b530cde21d42.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v21fcbdc5e20ab42c196c3b530cde21d43.jpg',
    ],
    description: '兰卡威海滨度假别墅，距离海滩步行仅需5分钟，视野开阔，可观海景，适合度假及长期居住。',
    facilities: ['WiFi', '空调', '洗衣机', '冰箱', '电视', '热水器', '泳池', '烧烤区', '露台'],
    landlord: {
      name: '陈女士',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      phone: '+60145678901'
    }
  },
  {
    id: 5,
    title: '怡保传统马来风格住宅',
    price: 900,
    currency: 'RM',
    area: 90,
    room: 2,
    address: '怡保 老城区',
    tags: ['传统风格', '安静社区', '配套齐全'],
    images: [
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2a4d3b8b90f404d48a48f86855c4d10d1.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2a4d3b8b90f404d48a48f86855c4d10d2.jpg',
      'https://pic1.58cdn.com.cn/nowater/webim/big/n_v2a4d3b8b90f404d48a48f86855c4d10d3.jpg',
    ],
    description: '位于怡保老城区的传统马来风格住宅，环境安静，周边有传统市场和美食街，体验当地生活。',
    facilities: ['WiFi', '空调', '洗衣机', '冰箱', '电视', '热水器', '小花园'],
    landlord: {
      name: '林先生',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg',
      phone: '+60132345678'
    }
  }
];

module.exports = {
  houseList
}; 