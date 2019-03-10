const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

const router = express.Router();

router.get('/', function(req, res) {
	res.render('login');
});

passport.use(new LocalStrategy({
		//used to redefine username field in callback
		usernameField: 'email',
	},
	// This is called on passport.authenticate
	async function(username, password, done) {
		let user;
		try {
			user = await User.findOne({ email: username });
		} catch(err) {
			return done(err);
		}
		if (!user) {
			return done(null, false, { message: "Account does not exist" });
		}
		if (!user.password) {
			return done(null, false, { message: "Account was made with either Google or Facebook. Try logging in with that" });
		}
		let result = await user.validPassword(password);
		if (!result) {
			return done(null, false, { message: "Incorrect password" });
		}
		console.log("Success");
		return done(null, user);
	}
));

passport.serializeUser(function(user, done) {
	console.log("serialize");
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	console.log("deserialize");
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

router.post('/', function(req,res,next) {
	// params in done() go to err, user, info
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			res.status(400).send("Error Logging in");
		}
		if (!user) {
			res.status(400).send(info.message);
		}
		else {
			req.logIn(user, function(err) {
				if (err) {
					return next(err);
				}
				res.status(200).send("Successfully logged in");
			});
		}
	})(req, res, next);
});

module.exports = router;