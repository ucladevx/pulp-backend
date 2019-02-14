const express = require('express');
const path = require('path');

const app = express();

//environment variable
//make an actual environment variable
process.env.NODE_ENV = 'development';

const mongoHelper = require('./mongoHelper');
const config = require('./config/config.js');

mongoHelper.getDbConnection(function(err) {
	const apiRouter = require('./routes/api');

	app.set('views', path.join(__dirname, 'views'));	//sets default view paths
	app.set('view engine', 'ejs');
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, 'public')));

	app.use('/api', apiRouter);
});

app.listen(global.gConfig.port, () => {
	console.log(`In ${global.gConfig.config_id} mode`);
	console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.port}`);
});





// const MongoClient = require('mongodb').MongoClient;
// const mongo_uri = 'mongodb+srv://pulpdevx:GoravGinapulp@cluster0.mongodb.net/admin';
// const client = new MongoClient(mongo_uri, { useNewUrlParser: true });
// client.connect(err => {
// 	const collection = client.db("pulp_test").collection("devices");
// 	collection.insertOne({name:  "Joe Buin", email: "joebruin@ucla.edu", age: 100})
//    // perform actions on the collection object
// 	client.close();
// });