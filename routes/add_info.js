const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', function(req, res){
	res.render('add_info');
	console.log(req.user);
});

router.post('/', function(req, res){
	if (req.body.profile_name && req.body.school && req.body.interests) {
		let addData = {
			profile_name: req.body.profile_name,
			school: req.body.school,
			interests: req.body.interests
		}
	}
});

module.exports = router;
