const express = require('express');

const router = express.Router();

// Retrieves login ejs on GET
router.get('/', function(req, res) {
	res.render('create_user');
});

// TODO: instead of console.log messages, pass the error message in later on so that front end can use it. Ask what format they want it in.
router.post('/', function(req, res, next) {
	if (req.body.first_name && req.body.last_name && req.body.birthday && req.body.gender && req.body.email && req.body.password && req.body.passwordConf) {
		let userData = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			birthday: req.body.birthday,
			gender: req.body.gender,
			email: req.body.email,
			password: req.body.password
		}
		if (req.body.password != req.body.passwordConf) {
			console.log("Passwords do not match");
			res.render('create_user')
		}
		else {
			User.create(userData, function (err, user) {
				if (err) {
					console.log(`${req.body.email} already exists`);
				}
				else {
					console.log("User Created");
					res.redirect('/success');
				}
			})
		}
	}
	else {
		console.log("all field required");
		res.render('create_user');
	}
	let user = User.findOne({ email: req.body.email });
})

module.exports = router;