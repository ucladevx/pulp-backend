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
		usernameField: 'email'
	},
	async function(username, password, done) {
		let user;
		try {
			user = await User.findOne({ email: username });
		} catch(err) {
			console.log('error');
			return done(err);
		}
		if (!user) {
			console.log('No account with email exists');
			return done(null, false, { message: "Account does not exist" });
		}
		if (!user.password) {
			console.log("Account was made with either Google or Facebook. Try logging in with that");
			return done(null, false, { message: "Account was made with either Google or Facebook. Try logging in with that" });
		}
		let result = await user.validPassword(password);
		if (!result) {
			console.log("Incorrect password");
			return done(null, false, { message: "Incorrect password "});
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

router.post('/', passport.authenticate('local', { 
	successRedirect: '/success',
	failureRedirect: '/login'
}));

module.exports = router;