const express = require('express');
const path = require('path');

const app = express();

//environment variable
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