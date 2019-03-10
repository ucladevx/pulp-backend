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
UserSchema.statics.findOrCreate = async function(user_info, type, next) {
	let user;
	try {
		if (type == 'facebook') {
			user = await User.findOne({ facebook_login : user_info.facebook_login }).exec();
		}
		if (type == 'google') {
			user = await User.findOne({ google_login : user_info.google_login }).exec();
		}
	} catch(err) {
		return next(err);
	}
	if (!user) {
		try {
			user = await User.create(user_info);
		} catch(err) {
			console.log(err);
			console.log("Failed to create user. Email registered with Facebook/Google already has an account");
			return next(null, false);				//Unsure how to handle this error. Causes mongoDB to fail.
		}
		console.log("Created user");
		return next(null, user);
	}
	else {
		console.log("User exists");
		return next(null, user);
	}
}

module.exports = User = mongoose.model('User', UserSchema);