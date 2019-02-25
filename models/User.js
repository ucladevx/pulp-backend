const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
	password: String,
	interests: [String]
});

//{collection:'users'}

//Hash password before saving to MongoDb. create() calls the save() hook
UserSchema.pre('save',  function(next) {
	let user = this;
	if (!user.isModified('password')) { 
		return next(); 
	}
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});

UserSchema.methods.validPassword = async function(password) {
	let user = this;
	const match = await bcrypt.compare(password, user.password);
	if (match) {
		return true;
	}
	return false;
}

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
						console.log("Failed to create user. Email registered with Facebook/Google already has an account");
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