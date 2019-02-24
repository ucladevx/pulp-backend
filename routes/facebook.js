const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const router = express.Router();

// For facebook authentication
passport.use(new FacebookStrategy({
	clientID: global.gConfig.FB_APP_ID,
	clientSecret: global.gConfig.FB_APP_SECRET,
	callbackURL: 'https://localhost:'+global.gConfig.port+'/auth/facebook/callback', 
	profileFields: ['id', 'email', 'name'],
	},
	// Creates/finds FB profile and returns with callback
	function(accessToken, refreshToken, profile, done) {
		// Info on user. Check http://www.passportjs.org/docs/profile/ for more fields if needed
		let user_info = {
			first_name: profile.name.givenName,
			last_name: profile.name.familyName,
			email: profile.emails[0].value,
			facebook_login: profile.id
		}
		User.findOrCreate(user_info, function(err,user) {
			if (err) {
				console.log("got an error");
				return done(err);
			}
			console.log(user);
			done(null, user);
		});
	}
));

//Not doing anything right now. Look up later on how to use properly.
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

router.get('/', passport.authenticate('facebook'));

// Always goes to failureRedirect. Figure out why
router.get('/callback', function(req, res, next) {
	passport.authenticate('facebook', function(err, user, info) {
		if (err) {
			console.log(err);
			return next(err);
		}
		if (!user) {
			console.log("no user");
			return res.redirect('/login');
		}
		console.log('everything good');
		return res.redirect('/success');
	})(req, res, next);
});

module.exports = router;