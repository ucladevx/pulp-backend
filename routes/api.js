const express = require('express');
const router = express.Router();

const mongoHelper = require('../mongoHelper');

const db = mongoHelper.getDb();

module.exports = router;
