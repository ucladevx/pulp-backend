const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const router = express.Router();
const User = require('../models/User');

// Retrieves login ejs on GET
router.get('/', function(req, res) {
	res.render('create_user');
});

passport.use('local-signup', new LocalStrategy({
		passReqToCallback: true,
		usernameField: 'email'		// sets the username field in below async function to email instead
	},
	async function (req, username, password, done) {
		let user_info = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			birthday: req.body.birthday,
			gender: req.body.gender,
			email: req.body.email,
			password: req.body.password
		}
		User.findOrCreate(user_info, "create", function(err, user) {
			console.log(user);
			done(err, user);
		});
	}
));

router.post('/', function(req, res, done) {
	if (req.body.password != req.body.passwordConf) {
		res.status(400).send("Passwords do not match.");
	}
	passport.authenticate('local-signup', function(err, user, info) {
		if (err) {
			res.status(400).send("Error creating user");
		}
		if (!user) {
			res.status(400).send("User with this email already exists");
		}
		else {
			req.logIn(user, function(err) {
				if (err) {
					return done(err);
				}
				res.status(200).redirect("add_info");
			});
		}
	})(req, res, done);
});

module.exports = router;