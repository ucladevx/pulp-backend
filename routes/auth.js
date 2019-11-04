const User = require('../models/User');

module.exports = (router, passport) => {

	router.get('/auth', passport.authenticate('facebook', { scope: ['email', 'user_friends', 'user_birthday'] }));

	router.get('/auth/callback', function(req,res,next) {
		passport.authenticate('facebook', function(err, user, is_new) {
			if (err) {
				res.status(400).send("Error Logging in");
			}
			if (!user) {
				res.status(400).send("Error creating account. Email registered with Facebook already has an account.");
			}
			else {
				req.logIn(user, async function(err) {
					if (err) {
						return next(err);
					}
					if (is_new) {
						await User.updateFriends(user.facebook_login, user.friends);
						res.status(200).send('Successfully Created New User');
					}
					else {
						res.status(200).send("Successfully logged in existing user");
					}
				});
			}
		})(req, res, next);
	});

	router.get('/deauth', async (req, res) => {
		console.log('/deauth')
		console.log(req.user);
		const { _id } = req.user
		await User.deauth(_id);
		res.status(200).send('Successfully deauth')
	})
}