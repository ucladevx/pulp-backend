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
	birthday: {
		type: String,
		//required: true,
	},
	gender: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	facebook_login: String,
	google_login: String,
	internal_password: String,
	interests: [String]
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
						return next(err, user);
					}
				});
			}
			else {
				console.log("User exists")
				return next(err, user);
			}
		});
}

module.exports = User = mongoose.model('User', UserSchema);