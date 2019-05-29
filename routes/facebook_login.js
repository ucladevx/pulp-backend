const express = require('express');
const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token')
const User = require('../models/User');

const router = express.Router();

// For facebook authentication
passport.use('facebook-token', new FacebookTokenStrategy({
	clientID: global.gConfig.FB_APP_ID,
	clientSecret: global.gConfig.FB_APP_SECRET,
	},
	function(accessToken, refreshToken, profile, done) {
		console.log(profile)
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
			friends: friends_id
		}
		User.findOrCreate(user_info, 'facebook', function(err, user) {
			done(err, user);
		});
	}
))

router.get('/:access_token', 
	passport.authenticate(['facebook-token']),
	function(req, res) {
		if (req.user) {		//user is authenticated
			console.log(req.user);
			res.send(200, "nice");
		}
		else {
			console.log('huh')
			res.send(401);
		}
	}
);

module.exports = router;