/**
 * 服务器配置信息
 *
 */
 
var path = require('path'); 
var fs = require('fs');
 
exports.path = '/page/server_info';

// 显示应用信息
exports.get = function (req, res) {
  // 权限验证
  if (!global.QuickWeb.master.checkAuth(req.auth())) {
    res.authFail();
    return;
  }
  
  res.renderFile('server_info.html', {config: global.QuickWeb.master.config});
}

