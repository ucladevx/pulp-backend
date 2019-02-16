const mongoose = require('mongoose');
const express = require('express');

const router = express.Router();

// Retrieves login ejs on GET
router.get('/', function(req, res) {
	res.render('login');
});

module.exports = router;