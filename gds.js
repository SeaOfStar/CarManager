
var querystring = require("querystring");

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/postgres';

// var targetID = "90214415182144735527"
var targetID = "14"

var last = null
var caredPosition = function(db, callback) {
	var cursor = db.collection('t_position').find({"gps_id": targetID}).sort({"position_time" : 1});
	cursor.each( function(err, doc) {
		if (doc != null) {
// 			console.dir(doc);
			last = doc
		} else {
			callback();
		}
	});
};

function getTPositionList(response, postData) {
	console.log("取得当前位置信息");
	
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("成功连接：" + url);
		
		caredPosition(db, function() {
		
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write(JSON.stringify(last));
			response.end();
			db.close();
		});
		
	});
	
	// var mongodb =require('mongodb');
// 	var server = new mongodb.Server('localhost', 27017, {auto_reconnect:true});
// 	var db = new mongodb.Db("postgres", server, {safe:true});
// 	db.open(function(err, client){
// 		if(!err){
// 			console.log('打开postgres成功');
// 
// 			// 对应的collection
// 			var collection = new mongodb.Collection(client, "t_position")
// 			
// 			var targetId = "90214415182144735527"
// 			
// 			collection.find(function(error, cursor) {
// 				cursor.each(function(err, doc) {
// 					if (doc) {
// 						console.log("find:\n" + doc)
// 					}
// 				});
// 			});
// 		
// 		}else{
// 			console.log(err);
// 		}
// 	});
	
}

exports.getTPositionList = getTPositionList
