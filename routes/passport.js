const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const router = express.Router();


module.exports = passport => {

	// For facebook authentication
	passport.use(new FacebookStrategy({
		clientID: global.gConfig.FB_APP_ID,
		clientSecret: global.gConfig.FB_APP_SECRET,
		callbackURL: 'https://localhost:'+global.gConfig.port+'/auth/callback', 
		profileFields: ['id', 'email', 'name', 'gender', 'friends'], // profileFields: 'birthday'
		},
		// Creates/finds FB profile and returns with callback
		function(accessToken, refreshToken, profile, done) {
			// Info on user. Check http://www.passportjs.org/docs/profile/ for more fields if needed
			let friends = profile._json.friends.data;
			let friends_id = [];
			for (let i = 0; i < friends.length; i++) {
				friends_id.push(friends[i].id);
			}
			let user_info = {
				first_name: profile.name.givenName,
				last_name: profile.name.familyName,
				birthday: profile._json.birthday,
				gender: profile.gender,
				email: profile.emails[0].value,
				facebook_login: profile.id,
				friends: friends_id,
				accessToken,
			}
			User.findOrCreate(user_info, 'facebook', function(err, user, is_new) {
				done(err, user, is_new);
			});
		}
	));

	// TODO: Sessions weird.

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
}
