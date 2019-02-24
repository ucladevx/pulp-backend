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
	profileFields: ['id', 'email', 'name', 'gender', 'birthday'],
	},
	// Creates/finds FB profile and returns with callback
	function(accessToken, refreshToken, profile, done) {
		// Info on user. Check http://www.passportjs.org/docs/profile/ for more fields if needed
		let user_info = {
			first_name: profile.name.givenName,
			last_name: profile.name.familyName,
			birthday: profile.birthday,				// TODO: birthday not working. 
			gender: profile.gender,
			email: profile.emails[0].value,
			facebook_login: profile.id
		}
		User.findOrCreate(user_info, function(err,user) {
			if (err) {
				console.log("got an error");
				return done(err);
			}
			done(null, user);
		});
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

router.get('/', passport.authenticate('facebook', {scope: ['user_birthday', 'user_gender']}));

router.get('/callback', passport.authenticate('facebook', {
	successRedirect: '/success',
	failureRedirect: '/login'
}));

module.exports = router;