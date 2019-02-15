const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');

const router = express.Router();

// Information Used for passport to connect with Facebook. Located at developers facebook.
const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

// Retrieves login ejs on GET
router.get('/', function(req, res) {
	res.render('login');
})

// For facebook authentication
// TODO: Not currently working.
passport.use(new FacebookStrategy({
	clientID: FB_APP_ID,
	clientSecret: FB_APP_SECRET,
	callbackURL: 'http://localhost:'+global.gConfig.port+'login/auth/facebook/callback' // Add URL to callback later? Check if its same for IOS
	},
	// Creates/finds FB profile and returns with callback
	function(accessToken, refreshToken, profile, cb) {
		User.findOrCreate({facebookId: profile.id}, function(err,user) {
			return cb(err, user);
		});
	}
));

router.get('/auth/facebook',
	passport.authenticate('facebook', { failureRedirect: '/login',
										successRedirect: '/success',
										scope: 'email'}),
	function (req, res) {
		res.redirect('/success');
});

module.exports = router;