const assert = require('assert');
const mongoose = require('mongoose');
const config = require('./config/config');

let db;
module.exports = {
	getDbConnection: function(callback) {
		mongoose.connect(global.gConfig.mongo_url, { useNewUrlParser: true}, function (err, database) {
			assert.equal(null, err);
			console.log("successfully connected to mongoDB");
			db = mongoose.connection.db;		//I believe this returns the db instance similar to Mongoclient db. Check later
			return callback(err);
		});
	},
	getDb: function() {
		return db;
	}
}