const express = require('express');

const router = express.Router();

// Retrieves login ejs on GET
router.get('/', function(req, res) {
	res.render('create_user');
});

router.post('/', async function(req, res, next) {
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
			res.status(400).send("Passwords do not match");
		}
		else {
			let user;
			try {
				user = await User.create(userData);
			} catch(err) {
				res.status(400).send(`${req.body.email} already exists`);
				return;
			}
			res.status(201).send("User successfully created");
		}
	}
	else {
		res.status(400).send("All fields required")
	}
});

module.exports = router;