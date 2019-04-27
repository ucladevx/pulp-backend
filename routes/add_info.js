const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/', function(req, res){
	res.render('add_info');
});

router.post('/', async function(req, res){
	console.log('post')
	console.log(req.user);
	if (req.body.profile_name && req.body.school && req.body.interests) {
		let addData = {
			profile_name: req.body.profile_name,
			school: req.body.school,
			interests: req.body.interests
		}
		// finds the user with the email req.user.email, adds the data, and returns the updated user.
		try {
			let user = await User.findOneAndUpdate({ email: req.user.email }, addData, { new: true })
		} catch(err) {
			console.log('Error adding information to user.');
			console.log(err)
		}
		res.status(200).send("success")
	}
	else {
		console.log("All fields required.")
	}
});

module.exports = router;
