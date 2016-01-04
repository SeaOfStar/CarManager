
var querystring = require("querystring");

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/postgres';

var targetID = "90214415182144735527"
// var targetID = "14"

//////////////////////////////////
// 共通用的回调数据处理
//////////////////////////////////
function writeResponse(response, data) {
	var root = {};
	root['resultcode'] = 0;
	root['dataMap'] = data;

	response.writeHead(200, {"Content-Type": "text/json"});
	response.write(JSON.stringify(root));
	response.end();
}


//////////////////////////////////
// 取得当前车辆位置信息
//////////////////////////////////
var last = null
function getTPositionList(response, postData) {
	console.log("取得当前位置信息");
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("成功连接：" + url);
		
		caredPosition(db, function() {
			writeResponse(response, last);
			last = null;
			db.close();
		});
	});
}

var caredPosition = function(db, callback) {
	var cursor = db.collection('t_position').find({"gps_id": targetID}).sort({"position_time" : 1});
	cursor.each( function(err, doc) {
		if (doc != null) {
			last = doc
		} else {
			callback();
		}
	});
};


//////////////////////////////////
// 取得报警信息
//////////////////////////////////
var warnings = new Array();
function getReminderRecord(response, postData) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);

		reminderRecords(postData, db, function() {
			writeResponse(response, warnings);
			warnings = new Array();
			db.close();
		});
	});
}

function reminderRecords(postData, db, callback) {
		var cursor = db.collection('police_mark').find({"gps_id": targetID}).sort({"bzDateTime" : 1});
	cursor.each( function(err, doc) {
		if (doc != null) {
			warnings.push(doc)
		} else {
			callback();
		}
	});
}

//////////////////////////////////
// 导出函数
//////////////////////////////////
exports.getTPositionList = getTPositionList;
exports.getReminderRecord = getReminderRecord;