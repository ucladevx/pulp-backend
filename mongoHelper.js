const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config/config');

let db;
module.exports = {
	getDbConnection: function(callback) {
		MongoClient.connect(global.gConfig.mongo_url, { useNewUrlParser: true}, function (err, database) {
			assert.equal(null, err);
			console.log("successfully connected to mongoDB");
			db = database.db(global.gConfig.db);
			return callback(err);
		});
	},
	getDb: function() {
		return db;
	}
}