const messageList = [
  {
    id: 1,
    sender: {
      id: 101,
      name: '王先生',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg'
    },
    lastMessage: '您好，请问这套房子还有吗？',
    lastTime: '09:30',
    unread: 2
  },
  {
    id: 2,
    sender: {
      id: 102,
      name: '李女士',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg'
    },
    lastMessage: '我已经收到了您的定金，感谢支持！',
    lastTime: '昨天',
    unread: 0
  },
  {
    id: 3,
    sender: {
      id: 103,
      name: '张先生',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg'
    },
    lastMessage: '明天下午3点可以看房，请准时。',
    lastTime: '前天',
    unread: 0
  },
  {
    id: 4,
    sender: {
      id: 104,
      name: '大马租房客服',
      avatar: 'https://img.yzcdn.cn/vant/cat.jpeg'
    },
    lastMessage: '感谢您使用大马租房，如有问题请随时联系我们。',
    lastTime: '05-01',
    unread: 1
  }
];

const chatMessages = {
  1: [
    {
      id: 101,
      content: '您好，请问这套吉隆坡市中心的公寓还有吗？',
      time: '09:25',
      isSelf: false
    },
    {
      id: 102,
      content: '您好，这套公寓目前还在出租中，您有兴趣吗？',
      time: '09:27',
      isSelf: true
    },
    {
      id: 103,
      content: '是的，我很感兴趣，能告诉我更多关于这个公寓的信息吗？',
      time: '09:28',
      isSelf: false
    },
    {
      id: 104,
      content: '当然可以，这套公寓位于KLCC附近，交通便利，周边设施齐全。公寓80平米，2室1厅，家具家电齐全，可以拎包入住。',
      time: '09:30',
      isSelf: true
    }
  ],
  2: [
    {
      id: 201,
      content: '您好，我对槟城的那套别墅很感兴趣',
      time: '昨天 15:00',
      isSelf: false
    },
    {
      id: 202,
      content: '很高兴您对这套房子感兴趣，请问您什么时候方便看房？',
      time: '昨天 15:10',
      isSelf: true
    },
    {
      id: 203,
      content: '我想先付个定金，确定一下',
      time: '昨天 15:20',
      isSelf: false
    },
    {
      id: 204,
      content: '我已经收到了您的定金，感谢支持！',
      time: '昨天 16:00',
      isSelf: true
    }
  ],
  3: [
    {
      id: 301,
      content: '您好，我想了解一下新山的那套公寓',
      time: '前天 10:00',
      isSelf: false
    },
    {
      id: 302,
      content: '您好，有什么可以帮到您的吗？',
      time: '前天 10:05',
      isSelf: true
    },
    {
      id: 303,
      content: '我想看一下房子，什么时候方便？',
      time: '前天 10:10',
      isSelf: false
    },
    {
      id: 304,
      content: '明天下午3点可以看房，请准时。',
      time: '前天 10:15',
      isSelf: true
    }
  ],
  4: [
    {
      id: 401,
      content: '欢迎使用大马租房服务！',
      time: '05-01 08:00',
      isSelf: true
    },
    {
      id: 402,
      content: '感谢您使用大马租房，如有问题请随时联系我们。',
      time: '05-01 08:01',
      isSelf: true
    }
  ]
};

module.exports = {
  messageList,
  chatMessages
}; 