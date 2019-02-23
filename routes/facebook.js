const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

const router = express.Router();

// Information Used for passport to connect with Facebook. Located at developers facebook.
const FB_app_ID = process.env.FB_APP_ID;
const FB_app_secret = process.env.FB_APP_SECRET;

// For facebook authentication
passport.use(new FacebookStrategy({
	clientID: global.gConfig.FB_APP_ID,
	clientSecret: global.gConfig.FB_APP_SECRET,
	callbackURL: 'https://localhost:'+global.gConfig.port+'/auth/facebook/callback', 
	profileFields: ['id', 'email', 'name'],
	},
	// Creates/finds FB profile and returns with callback
	function(accessToken, refreshToken, profile, cb) {
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
			}
			return cb(err, user);
		});
	}
));

router.get('/', passport.authenticate('facebook', {scope: ['email']}));

// Always goes to failureRedirect. Figure out why
router.get('/callback', passport.authenticate('facebook', 
	{ successRedirect: '/success',
	failureRedirect: '/login',
	failureFlash: true,
	scope: 'email'}));

module.exports = router;