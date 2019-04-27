const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/User');

const router = express.Router();

passport.use(new GoogleStrategy({
	clientID: global.gConfig.GOOGLE_APP_ID,
	clientSecret: global.gConfig.GOOGLE_APP_SECRET,
	callbackURL: 'https://localhost:'+global.gConfig.port+'/auth/google/callback',
	profileFields: ['id', 'email', 'name', 'gender', 'birthday'],
	},
	function(accessToken, refreshToken, profile, done) {
		if (profile.gender == null) {
			profile.gender = "unknown";
		}
		let user_info = {
			first_name: profile.name.givenName,
			last_name: profile.name.familyName,
			gender: profile.gender,
			email: profile.emails[0].value,
			google_login: profile.id
		}
		console.log(profile)
		User.findOrCreate(user_info, 'google', function(err, user) {
			console.log(user)
			done(err, user);
		});
	}
));

router.get('/', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/callback', function(req, res, next) {
	passport.authenticate('google', function(err, user, info) {
		console.log(user)
		console.log(info)
		console.log(err);
		if (!user) {
			res.status(400).send("Error creating account. Email registered with Google already has an account")
		}
		else if (user) {
			req.logIn(user, function(err) {
				if (err) {
					return next(err);
				}
				res.status(200).render('add_info');
			});
		}
		else {
			res.status(400).send("Error Loggin in");
		}
	})(req, res, next);
});

module.exports = router;
