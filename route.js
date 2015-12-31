
var requestHandlers = require("./requestHandlers")
var handle = {}

// 函数绑定逻辑
handle["/"] = requestHandlers.mainpage;
handle["/start"] = requestHandlers.mainpage;
handle["/upload"] = requestHandlers.upload;


function route(pathname, response, postData) {
	
	console.log("对" + pathname + "进行路由调配");
	
	if (typeof handle[pathname] === 'function' ) {
		handle[pathname](response, postData);
	} else {
		console.log("没能找到【" + pathname +"】对应的处理函数");
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 not found");
		response.end();
	}
}

exports.route = route;