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
        console.log(profile);

        // BUG FROM BEFORE: profile._json.friends DNE when testing
        /*
		let friends = profile._json.friends.data;
		let friends_id = [];
		for (let i = 0; i < friends.length; i++) {
			friends_id.push(friends[i].id);
        }
        */

		let user_info = {
            // User info
			first_name: profile.name.givenName,
            last_name: profile.name.familyName,
			photo: profile.photos[0].value,
            friends: [],                    // will eventually be a list of friend's pulp id's (can search for them via their FB id's)
            places: [],                     //start empty?

            // Auth info
            access_token: accessToken,
            facebook_id:  profile.id
		}
		User.findOrCreate(user_info, 'facebook', function(err, user) {
			done(err, user);
		});
	}
))

router.get('/',
    passport.authenticate(['facebook-token']),
	async function(req, res) {
		if (req.user) {		//user is authenticated
            //console.log(req.user);
            res.status(200).send("User authenticated");
		}
		else {
			res.status(401).send('User authentication failed');
		}
	}
);

module.exports = router;
