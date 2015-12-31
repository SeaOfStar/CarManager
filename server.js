var http = require("http");
var url = require("url");

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
		
	}).listen(8888);

	console.log("服务器启动...");
}

exports.start = start;