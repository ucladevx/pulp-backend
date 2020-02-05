const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
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

var createTableIfNotExist = async function createTableIfNotExist(tableName, createFunction) {
	var params = {
		TableName: tableName /* required */
	};
	dynamodb.describeTable(params, function(err, data) {
		if (err) {
            // table could not be found --> create it
            console.log(`${tableName} table missing, attempting to create it ...`)
            createFunction()
            .then(() => {
                // initialize values for a new Tables_Data table
                if (tableName === "Tables_Data") {
                    // Init Tables_Data len
                    var init0 = {
                        TableName: "Tables_Data",
                        Item: { "table_id": { N: "0" }, "len": { N: "4" } },
                        ReturnConsumedCapacity: "TOTAL"
                    };
                    dynamodb.putItem(init0, async (err, data) => {
                        if (err)    { console.error(`Unable to initialize Tables_Data len to 4 --> ${err}`); }
                        else        { console.log("Initialized Tables_Data len to 4."); }
                    });

                    // Init User len
                    var init1 = {
                        TableName: "Tables_Data",
                        Item: { "table_id": { N: "1" }, "len": { N: "0" } },
                        ReturnConsumedCapacity: "TOTAL"
                    };
                    dynamodb.putItem(init1, async (err, data) => {
                        if (err)    { console.error(`Unable to initialize Users len to 0 --> ${err}`); }
                        else        { console.log("Initialized Users len to 0."); }
                    });

                    // Init Places len
                    var init2 = {
                        TableName: "Tables_Data",
                        Item: { "table_id": { N: "2" }, "len": { N: "0" } },
                        ReturnConsumedCapacity: "TOTAL"
                    };
                    dynamodb.putItem(init2, async (err, data) => {
                        if (err)    { console.error(`Unable to initialize Places len to 0 --> ${err}`); }
                        else        { console.log("Initialized Places len to 0."); }
                    });

                    // Init Reviews len
                    var init3 = {
                        TableName: "Tables_Data",
                        Item: { "table_id": { N: "3" }, "len": { N: "0" } },
                        ReturnConsumedCapacity: "TOTAL"
                    };
                    dynamodb.putItem(init3, async (err, data) => {
                        if (err)    { console.error(`Unable to initialize Reviews len to 0 --> ${err}`); }
                        else        { console.log("Initialized Reviews len to 0."); }
                    });
                }
            })
            .catch(() => {});
		}
		else {
            console.log(`${tableName} table already created.`);
		}
	});
}

// check if any tables need to be created
var createTables = async function createTables() {
	await createTableIfNotExist("Places", PlacesCreateTable.createPlacesTable)
	await createTableIfNotExist("Reviews", ReviewsCreateTable.createReviewsTable)
	await createTableIfNotExist("Users", UsersCreateTable.createUsersTable)
	await createTableIfNotExist("Tables_Data", Tables_DataCreateTable.createTables_DataTable)
}

// ensure that all 4 tables are created and initialized properly
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
