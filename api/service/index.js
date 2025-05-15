// service/index.js
// 导出所有服务

const bannerService = require('./bannerService');
const houseAreaService = require('./houseAreaService');
const houseListService = require('./houseListService');
const houseDetailService = require('./houseDetailService');
const userAccountService = require('./userAccountService');
const chatService = require('./chatService');

// 导出所有服务
module.exports = {
  bannerService,
  houseAreaService,
  houseListService,
  houseDetailService,
  userAccountService,
  chatService
}; 