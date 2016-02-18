
var querystring = require("querystring");

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var databaseConnectionURL = 'mongodb://localhost:27017/carService';

var targetID = "90214415182144735527"
// var targetID = "test66"

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
function getLocation(response, postData) {
	console.log("取得当前位置信息");
	
	MongoClient.connect(databaseConnectionURL, function(err, db) {
		assert.equal(null, err);
		console.log("成功连接：" + databaseConnectionURL);

		
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
	MongoClient.connect(databaseConnectionURL, function(err, db) {
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
			warnings.push(warningParser(doc));
		} else {
			callback();
		}
	});
}

// key变换成接口定义的key
function warningParser(doc) {

	var data = {};
	data['gps_id'] = doc['gps_id'];
	data['latitude'] = doc['dLatitudeDegree'];
	data['longitude'] = doc['dLongitudeDegree'];
// 	data['time'] = doc['bzDateTime'].getTime());
	data['time'] = doc['bzDateTime'];
	
// 	var warningType = doc['digit'];
// 	var typeString = doc['info'];
// 	if (warningType != null) {
// 		if (warningType == 12) {
// 			typeString = '震动报警';
// 		}
// 	}
	data['warningDetail'] = doc['info'];
	
	return data;
}

//////////////////////////////////
// 车况信息
//////////////////////////////////
function getCarStatus(response, postData) {
		MongoClient.connect(databaseConnectionURL, function(err, db) {
		assert.equal(null, err);

		/**
			1.检索出所有跟该GPS相关的状态信息
			2.统计整体数据
			3.反馈整体数据和最新数据
		*/
		
		var statusArray =  new Array();
		
		fetchStatus(postData, db, statusArray, function() {
			// 创建返回数据
			var root = {};
			root['all'] = statusArray;
			
			writeResponse(response, root);
			db.close();
		});

	});
}

function fetchStatus(postData, db, list, callback) {
	var cursor = db.collection('OBDInfo').find({"gps_id": targetID}).sort({"reportTime" : 1});
	cursor.each( function(err, doc) {
		if (doc != null) {
			list.push(doc);
		} else {
			callback();
		}
	});
}



//////////////////////////////////
// 取得行程记录
//////////////////////////////////
function getTravel(response, postData) {
		MongoClient.connect(databaseConnectionURL, function(err, db) {
		assert.equal(null, err);
		
		// 所有的旅程数组
		var trips = new Array();
		var analyseInfo = {};		// 统计：次数、长度、时间、不良次数

		fetchRecords(postData, db, trips, analyseInfo, function() {
			var root = {}
			root['total'] = analyseInfo;
			root['trips'] = trips
			writeResponse(response, root);
			db.close();
		});
	});
}

function fetchRecords(postData, db, trips, analyseInfo, callback) {

	var bufferSize = 20;
	
	// 统计信息：
	var count = 0;
	var badCount = 0;
	var distance = 0.0;
	var duration = 0.0;
	

	var tripsCursor = db.collection('t_journey').find({"gps_id": targetID}).limit(bufferSize).sort({"BzstartTime" : -1});
	totalTripCount = tripsCursor.count;

	tripsCursor.each( function(err, tripDoc) {
		if (tripDoc != null) {
			count ++;
			distance += tripDoc["Distance"];
			duration += tripDoc["LongTime"];
			
			if (tripDoc["FatigueDriving"] > 0) {
				badCount ++;
			}
			else if (tripDoc["jjAccelerationNumber"] > 0) {
				badCount ++;
			}
			else if (tripDoc["jjBrakeNumber"] > 0) {
				badCount ++;
			}
		
			trips.push(tripDoc);
		} 
		else {
			// 更新统计信息
			analyseInfo['journeyCount'] = count;
			analyseInfo['journeyBad'] = badCount;
			analyseInfo['journeyS'] = distance;
			analyseInfo['journeyTime'] = duration;
			
			callback();
		}
	});

}

//////////////////////////////////
// 导出函数
//////////////////////////////////
exports.getLocation = getLocation;
exports.getReminderRecord = getReminderRecord;
exports.getCarStatus = getCarStatus;
exports.getTravel = getTravel;