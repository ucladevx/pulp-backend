const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();

const mongoHelper = require('./mongoHelper');
const config = require('./config/config.js');

mongoHelper.getDbConnection(function(err) {
	const apiRouter = require('./routes/api');
	const loginRouter = require('./routes/login');
	const facebookRouter = require('./routes/facebook');
	const successRouter = require('./routes/success'); 		// Used for Testing. Delete Later

	app.set('views', path.join(__dirname, 'views'));		// Sets default view paths
	app.set('view engine', 'ejs');
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(path.join(__dirname, 'public')));

	app.use('/api', apiRouter);
	app.use('/login', loginRouter);
	app.use('/auth/facebook', facebookRouter);
	app.use('/success', successRouter);						// Used for Testing. Delete Later
});

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