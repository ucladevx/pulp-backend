const mongoose = require('mongoose');

//Defining User Schema for Different types of login
/*
const reviewSubSchema = new Schema({
	location: String,
	title: String,
	body: String,
	rating: Number
});
*/

var UserSchema = new mongoose.Schema({
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: true,
	},
	email: String,
	username: String,
	facebook_login: String,
	google_login: String,
	internal_username: String,
	internal_password: String
});

//{collection:'users'}

// Creating user works. Add sessions later on inside both the else blocks.
UserSchema.statics.findOrCreate = function(user_info, next) {
	User.findOne({ facebook_login : user_info.facebook_login })
		.exec(function(err, user) {
			if (err) {
				return next(err);
			}
			else if (!user) {
				User.create(user_info, function(err, user) {
					if (err) {
						console.log(err)
						console.log("Failed to create user");
					}
					else {
						console.log("Created User");
						return next();
					}
				});
			}
			else {
				console.log("User exists")
				return next();
			}
		});
}

module.exports = User = mongoose.model('User', UserSchema);