const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const AWS= require('aws-sdk');
const passport = require('passport');
const flash = require('connect-flash');
const session = require("express-session");
var cors = require('cors')

var AWS = require("aws-sdk");

//import modules to create table
var PlacesCreateTable = require("./createTables/PlacesCreateTable")
var ReviewsCreateTable = require("./createTables/ReviewsCreateTable")
var UsersCreateTable = require("./createTables/UsersCreateTable")
var Tables_DataCreateTable = require("./createTables/Tables_DataCreateTable")

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8000"
});

// test dynamodb external
// COMMENT THIS OUT WHEN tESTING ON LOCAL
//AWS.config.update({region: "us-west-2"});


var dynamodb = new AWS.DynamoDB();

var createTableIfNotExist = function createTableIfNotExist(tableName, createFunction) {
	console.log("Check table: " + tableName);
	var params = {
		TableName: tableName /* required */
	};
	dynamodb.describeTable(params, function(err, data) {
		console.log("in describe table")
		console.log(data)
		if (err) {
			status="false";
			console.log("there is some kind of error")
			//mmeaning table could not be found
			createFunction()
			//console.log(err, err.stack); // an error occurred
		}
		else {
			status=("true");
			console.log(data); // successful response
		}
		console.log("STATUS===========>"+status);
	});
}

var createTables = async function createTables(){
	await createTableIfNotExist("Places", PlacesCreateTable.createPlacesTable)
	console.log("create table one is done")
	await createTableIfNotExist("Reviews", ReviewsCreateTable.createReviewsTable)
	await createTableIfNotExist("Users", UsersCreateTable.createUsersTable)
	await createTableIfNotExist("Tables_Data", Tables_DataCreateTable.createTables_DataTable)
}

createTables()


const app = express();

app.use(cors())

// MAKE SURE TO SET TO TESTING WHEN DEPLOYING TO AWS
// DEVELOPMENT IS ONLY FOR LOCAL
//environment variable
//development
//process.env.NODE_ENV = 'testing';
process.env.NODE_ENV = 'development';
const config = require('./config/config.js');

//db connection
console.log(global.gConfig.dynamo_url);
//console.log(global.gConfig.mongo_url);
//console.log(global.gConfig.db);

/*
mongoose.connect(global.gConfig.mongo_url, ({dbName: global.gConfig.db}, { useNewUrlParser: true}));
let db = mongoose.connection;
mongoose.Promise = global.Promise;
db.once('open', () => {
	console.log('Successfully connected');
	mongoose.connection.db.listCollections().toArray(function (err, names) {
			console.log(names); // [{ name: 'dbname.myCollection' }]
			module.exports.Collection = names;
	});
});
db.on('error', console.error.bind(console, 'conn error:'));
*/
//routers

    // old -- mongo
//const apiRouter = require('./routes/old_api');

    // new -- dynamo
const apiRouter = require('./routes/api')


//const createUserRouter = require('./routes/create_user');
const loginRouter = require('./routes/login');
const facebookRouter = require('./routes/facebook_login');
//const googleRouter = require('./routes/google_login');
//const addInfoRouter = require('./routes/add_info');
const changeInfoRouter = require('./routes/change_info');

app.set('views', path.join(__dirname, 'views'));		// Sets default view paths
app.set('view engine', 'ejs');
app.use(express.json());
app.use(session({
	secret: 'purple',
	resave: false,
	saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.session());
app.use(flash());

app.use('/api', apiRouter);
//app.use('/create_user', createUserRouter);
//app.use('/login', loginRouter);
app.use('/auth/facebook', facebookRouter);
//app.use('/auth/google', googleRouter);
//app.use('/add_info', addInfoRouter);
app.use('/change_info', changeInfoRouter);

/*
//enable cors
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Headers', 'application/json');
  	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', '*');
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
*/
//auth
const options = {											// Used for certificate for HTTPS
	key: fs.readFileSync('server.key'),
	cert: fs.readFileSync('server.crt')
};

https
	.createServer(options, app)
	.listen(global.gConfig.port, function() {
		console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.port}`);
	});
/*
app.listen(global.gConfig.port, () => {
	console.log(`In ${global.gConfig.config_id} mode`);
	console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.port}`);
});
*/
