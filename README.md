# QuickWeb

## 为什么要写QuickWeb

在此之前，我用过小问的[Web.js](https://github.com/iwillwen/Web.js)，当写的处理程序逐渐增大时，那种将各个
处理程序放在一个文件中注册的方式使代码显得有点凌乱。有时候我希望像
PHP那样，直接复制一个文件到某个指定目录然后就能运行，要移除某个处理
程序时，只需要删除相应的文件即可。

Web.js的主旨是“简单化部署”，它的做法是尽可能的少的输入代码，将所有
处理程序放在少数的几个文件里，以显出文件规模的小。我觉得它没有考虑
到文件的组织问题。


## QuickWeb的“简单化部署”

所有处理程序都放在相应独立的文件里，系统可以像搭积木一样任意增删各
种功能，这才是QuickWeb所理解的“简单”。

QuickWeb的核心只封装了Nodejs内置模块中的http.Server、http.ServerRequest、
http.ServerResponse，以及一个简单的插件管理器，它要处理HTTP请求必须
依靠加载的各种插件来完成。比如cookie，session，router，POST数据解析
等待这些功能都需要相应的插件。

以下是一个最基本的QuickWeb启动代码：

```javascript
var plus = require('./core/plus');
var web = require('./core/web');

var PLUS_PATH = './plus';			// 插件目录
var SERVER_PORT = 80;				// 服务器端口

// 载入插件并启动服务器
plus.load(PLUS_PATH);
var s = web.create(SERVER_PORT);
```


## 插件的运行机制

在启动服务器之前，系统会先通过plus.load(PLUS_PATH)来载入插件：PLUS_PATH是插件
所在的目录，在插件目录里面的所有.js文件，或者子目录里面存在index.js的都将会被
加载；插件有两种类型：处理链与静态方法，可以注册到server、request、response这
三个对象上。

以下是plus目录中的文件列表：
+ 01.router	路由
+ 99.file 静态文件服务
+ 00.cookie.js Cookie解析
+ 00.get.js GET参数解析
+ 00.post.js POST数据解析
+ 00.response.js 扩展response的方法

插件的加载顺序决定了它的执行顺序，有时候需要让插件在最前或最后运行，或者某个插件
需要依赖另外的插件来先执行，因此，在QuickWeb中约定，通过在插件文件名中加上一个两
位数的数字以及一个小数点了指定其执行顺序，数字越小顺序越靠前：
+ 00.post.js、00.get.js、00.cookie.js表示在所有其他插件运行的前面
+ 01.router需要依赖与00.get.js
+ 99.file是静态文件服务，仅当其他插件无法处理请求时，才尝试判断是否为请求一个静态文件


## 插件的编写

以下是解析GET参数的插件00.get.js的代码：

```javascript
var url = require('url'); 
 
exports.init_request = function (web, request, debug) {
	request.addListener(function (req) {
		var v = url.parse(req.url, true);
		req.get = v.query || {};				// 问号后面的参数
		req.filename = v.pathname || '/';		// 文件名
		
		req.next();
	}, true);
}
```

插件需要注册到那个对象上，是通过其输出的函数来确定的。如输出init_request表示需要注册到
request对象上，相应地，注册到response对象需要输出init_response，注册到server对象需要输出
init_server。

init_request函数接收三个参数：
+ web QuickWeb对象，可以通过它来获取系统配置信息
+ request request对象，通过他来完成注册功能
+ debug 调试输出函数

