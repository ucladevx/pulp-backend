const apiRouter = require('../routes/api');
const express = require('express');
var cors = require('cors');
const app = express();
var http = require('http');
app.use(cors())
app.use(express.json());
app.use('/api', apiRouter);
var server = http.createServer(app);
server.listen(3001, function () {
    console.log("Listen to port 3001");
});