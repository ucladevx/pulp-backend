const User = require('../models/User');

module.exports = (router) => {
	router.post('/change', async function(req, res) {
		let user = User.findOne({ email: req.user.email });
		let updated_user = {
			first_name: ((req.body.first_name != null) ? req.body.first_name : req.user.first_name),
			last_name: ((req.body.last_name != null) ? req.body.last_name : req.user.last_name),
			gender: ((req.body.gender != null) ? req.body.gender : req.user.gender),
			profile_name: ((req.body.profile_name != null) ? req.body.profile_name : req.user.profile_name),
			school: ((req.body.school != null) ? req.body.school : req.user.school),
			birthday: ((req.body.birthday != null) ? req.body.birthday : req.user.birthday),
			interests: ((req.body.interests != null) ? req.body.interests : req.user.interests)
		}
		try {
			let user = await User.findOneAndUpdate({ email: req.user.email }, updated_user, { new: true })
		} catch(err) {
			console.log('Error adding information to user.');
			console.log(err)
			res.status(400).send("Error adding information to user.");
		}
		res.status(200).send("success")
	});

	router.get('/', async (req, res) => {
		let _id = req.query.id;
		let user;
		try {
			user = await User.findOne({ _id });
		} catch (err) {
			console.log('err');
			return (null);
		}
		res.status(200).send(user);
	});
}