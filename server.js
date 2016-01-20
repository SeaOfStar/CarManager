var http = require("http");
var url = require("url");
var port = 8088;

function start(route) {
	http.createServer(function(request, response) {
		var postData = "";
	
		var pathname = url.parse(request.url).pathname;
		console.log("收到请求" + pathname);
		
		request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
		});
		
				
		request.addListener("end", function(postDataChunk) {
			route(pathname, response, postData);
		});
		
	}).listen(port);

	console.log("服务器[" + port + "] 启动...");
}

exports.start = start;