// 数据适配器 - 用于处理API返回的数据，确保与小程序页面结构兼容

// 默认图片配置
const DEFAULT_IMAGES = {
  HOUSE: "https://img.yzcdn.cn/vant/cat.jpeg",
  AVATAR: "https://img.yzcdn.cn/vant/cat.jpeg"
};

// 从request.js导入BASE_URL
const { BASE_URL } = require('./request');

/**
 * 转换房源列表数据
 * @param {Array} apiHouses - 后端API返回的房源列表数据
 * @returns {Array} - 转换后的房源列表数据
 */
const adaptHouseList = (apiHouses) => {
  if (!apiHouses || !Array.isArray(apiHouses)) {
    return [];
  }

  return apiHouses.map(house => {
    // 处理图片URL，确保是完整的网络路径
    let images = [];
    if (house.images && house.images.length > 0) {
      images = house.images.map(img => ensureFullImageUrl(img));
    } else if (house.coverImage) {
      images = [ensureFullImageUrl(house.coverImage)];
    } else {
      // 默认图片
      images = [DEFAULT_IMAGES.HOUSE];
    }
    
    // 随机取3个标签
    let tags = house.tags;
    if (Array.isArray(tags) && tags.length > 3) {
      tags = shuffleArray(tags).slice(0, 3);
    }
    
    // 处理浏览历史时间格式（如果有）
    let historyTime = '';
    if (house.history_time) {
      try {
        // 尝试格式化历史时间
        const date = new Date(house.history_time);
        historyTime = formatHistoryTime(date);
      } catch (e) {
        console.error('历史时间格式化错误:', e);
      }
    }
    
    // 仅处理图片URL和标签，保持其他所有字段不变
    return {
      ...house,
      images: images,
      tags: tags,
      historyTime: historyTime
    };
  });
};

/**
 * 格式化浏览历史时间
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的时间字符串
 */
const formatHistoryTime = (date) => {
  // 无效日期返回空字符串
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  // 不同时间段使用不同的显示格式
  if (diffSec < 60) {
    return '刚刚';
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`;
  } else if (diffHour < 24) {
    return `${diffHour}小时前`;
  } else if (diffDay < 7) {
    return `${diffDay}天前`;
  } else {
    // 超过一周显示具体日期
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

/**
 * 确保图片URL是完整的网络路径
 * @param {string} url - 原始图片URL
 * @returns {string} - 处理后的完整URL
 */
const ensureFullImageUrl = (url) => {
  if (!url) return DEFAULT_IMAGES.HOUSE;
  
  // 如果URL是占位图片placeholder.svg，返回默认图片
  if (url.includes('placeholder.svg')) {
    return DEFAULT_IMAGES.HOUSE;
  }
  
  // 如果已经是完整的http/https URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 提取BASE_URL的域名部分（如 http://localhost:5000）
  const domain = BASE_URL.split('/api')[0];
  
  // 如果是uploads路径（后端静态资源），直接拼接到域名
  if (url.startsWith('/uploads/')) {
    return `${domain}${url}`;
  }
  
  // 如果是其他路径但以/开头，可能是其他静态资源
  if (url.startsWith('/')) {
    return `${domain}${url}`;
  }
  
  // 如果缺少路径前缀，假设是property图片
  if (!url.includes('/')) {
    return `${domain}/uploads/property/${url}`;
  }
  
  // 其他情况，返回默认图片
  return DEFAULT_IMAGES.HOUSE;
};

/**
 * 确保头像URL是完整的网络路径
 * @param {string} avatar - 原始头像URL
 * @returns {string} - 处理后的完整URL
 */
const ensureFullAvatarUrl = (avatar) => {
  // 如果头像值是default关键字或为空，返回本地默认头像
  if (!avatar || avatar === 'default') {
    return 'images/default-avatar.png';  // 直接使用本地路径，不发起网络请求
  }
  
  // 如果已经是完整的http/https URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // 处理placeholder.svg格式的头像
  if (avatar.includes('placeholder.svg')) {
    // 返回完整的placeholder路径
    return avatar;
  }
  
  // 提取BASE_URL的域名部分（如 http://localhost:5000）
  const domain = BASE_URL.split('/api')[0];
  
  // 拼接为正确的头像URL格式
  return `${domain}/uploads/avatar/${avatar}`;
};

/**
 * 解析房间类型，提取房间数量
 * @param {string} roomType - 如 "2房1厅"
 * @returns {number} - 房间数量
 */
const parseRoomType = (roomType) => {
  if (!roomType) return 1;
  
  // 尝试从房型中提取数字
  const matches = roomType.match(/(\d+)房/);
  if (matches && matches[1]) {
    return parseInt(matches[1], 10);
  }
  
  // 默认返回1
  return 1;
};

/**
 * 转换区域数据为下拉选项格式
 * @param {Array} apiAreas - 后端API返回的区域列表
 * @returns {Array} - 转换后的区域选项列表
 */
const adaptAreaOptions = (apiAreas) => {
  if (!apiAreas || !Array.isArray(apiAreas)) {
    return ['全部区域'];
  }

  // 先添加"全部区域"选项
  const areaOptions = ['全部区域'];
  
  // 添加API返回的区域名称
  apiAreas.forEach(area => {
    if (area.name) {
      areaOptions.push(area.name);
    }
  });
  
  return areaOptions;
};

/**
 * 随机打乱数组元素
 * @param {Array} array - 要打乱的数组
 * @returns {Array} - 打乱后的数组
 */
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

module.exports = {
  adaptHouseList,
  adaptAreaOptions,
  ensureFullImageUrl,
  ensureFullAvatarUrl,
  formatHistoryTime
}; 