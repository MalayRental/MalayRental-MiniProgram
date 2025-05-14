# API模块使用说明

## 目录结构

```
api/
├── api.js          # 定义baseURL和API URL常量
├── request.js      # 封装HTTP请求工具
├── service/        # 服务层目录
│   ├── index.js        # 导出所有服务
│   ├── bannerService.js # Banner服务
│   └── ...             # 其他服务
└── README.md       # 说明文档
```

## 使用方法

### 1. 导入服务

在页面中导入需要的服务：

```javascript
const { bannerService } = require('../../api/service/index');
```

### 2. 调用服务方法

```javascript
// 获取Banner列表
bannerService.getBannerList()
  .then(banners => {
    // 处理返回数据
    this.setData({
      banners: banners
    });
  })
  .catch(error => {
    console.error('获取Banner失败:', error);
    // 处理错误
  });
```

## 添加新API

### 1. 在api.js中添加API URL

```javascript
const API = {
  // 已有API...
  
  // 添加新的API
  NEW_MODULE: {
    GET_DATA: '/api/newModule/getData',
    POST_DATA: '/api/newModule/postData'
  }
};
```

### 2. 创建新的服务文件

在service目录下创建新的服务文件，如newModuleService.js：

```javascript
const { get, post } = require('../request');
const { API } = require('../api');

const getNewModuleData = () => {
  return get(API.NEW_MODULE.GET_DATA)
    .then(response => {
      // 处理响应数据
      return response.data;
    });
};

const postNewModuleData = (data) => {
  return post(API.NEW_MODULE.POST_DATA, {
    message: "提交数据",
    data: data
  });
};

module.exports = {
  getNewModuleData,
  postNewModuleData
};
```

### 3. 在service/index.js中导出新服务

```javascript
const bannerService = require('./bannerService');
const newModuleService = require('./newModuleService');

module.exports = {
  bannerService,
  newModuleService
};
```

### 4. 在页面中使用新服务

```javascript
const { newModuleService } = require('../../api/service/index');

// 使用新服务
newModuleService.getNewModuleData()
  .then(data => {
    // 处理数据
  })
  .catch(error => {
    // 处理错误
  });
```

## 错误处理

API请求错误统一由request.js处理，常见错误包括：

1. 网络错误 - 显示"网络错误，请稍后重试"提示
2. 401错误 - 登录过期，清除token并提示"登录已过期，请重新登录"
3. 其他错误 - 显示服务器返回的错误消息

## 数据格式

1. 请求格式：
```json
{
  "message": "操作描述",
  "timestamp": 1747211360241,
  "data": 操作数据
}
```

2. 响应格式：
```json
{
  "code": 200,
  "message": "操作成功",
  "timestamp": 1747211360241,
  "data": 返回数据
}
``` 