const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

const router = express.Router();

// Information Used for passport to connect with Facebook. Located at developers facebook.
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

// For facebook authentication
// TODO: Not currently working. 
passport.use(new FacebookStrategy({
	clientID: FB_APP_ID,
	clientSecret: FB_APP_SECRET,
	callbackURL: 'https://localhost:'+global.gConfig.port+'/auth/facebook/callback', // Add URL to callback later? Check if its same for IOS
	profileFields: ['id', 'email', 'name'],
	},
	// Creates/finds FB profile and returns with callback
	function(accessToken, refreshToken, profile, cb) {
		console.log('here')
		console.log(profile)
		console.log(profile.givenName)
		let user_info = {
			first_name: profile.givenName,
			last_name: profile.familyName,
			email: profile.emails[0],
			facebook_login: profile.id
		}
		User.findOrCreate(user_info, function(err,user) {
			console.log('hello')
			return cb(err, user);
		});
	}
));

router.get('/', passport.authenticate('facebook', {scope: ['email']}));

router.get('/callback', passport.authenticate('facebook', 
	{ failureRedirect: '/login',
	successRedirect: '/success',
	scope: 'email'}));

module.exports = router;