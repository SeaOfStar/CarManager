
var exec = require("child_process").exec;
var querystring = require("querystring");

function start(response, postData) {
	console.log("处理函数start()被调用")
	
	var body = '<html>' +
	'<head>' +
	'<meta http-equiv="Content-Type" content="text/html; ' +
	'charset="UTF-8" />' +
	'<head>' +
	'<body>' +
	'<form action="/upload" method="post">' +
	'<textarea name="text" rows="20" cols="60"></textarea>' +
	'<input type="submit" value="Submit text" />' +
	'</form>' +
	'</body>' +
	'</html>';
	
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
	
}

function upload(response, postData) {
	console.log("upload()被调用")
	response.writeHead(200, {"Content-Type": "text/plain"});
	var text = querystring.parse(postData).text
	response.write("upload :\n" + text);
	response.end();
}

exports.mainpage = start
exports.upload = upload
