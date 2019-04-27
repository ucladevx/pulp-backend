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
	profile_name: {
		type: String,
	},
	birthday: {
		type: String,
		//required: true,
	},
	gender: {
		type: String,
		required: true,
	},
	school: {
		type: String,
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

//Hash password before saving to MongoDb. create() calls the save() hook
UserSchema.pre('save',  function(done) {
	let user = this;
	if (!user.isModified('password')) { 
		return done(); 
	}
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return done(err);
		}
		user.password = hash;
		done();
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

/*
UserSchema.statics.update = async function(new_info, user_id, done) {
	let user;
	try {
		user = await User.findOne({})
	}
}
*/

UserSchema.statics.add_info = async function (new_info, user, done) {

}

// Creating user works. Add sessions later on inside both the else blocks.
UserSchema.statics.findOrCreate = async function(user_info, type, done) {
	let user;
	try {
		if (type == 'facebook') {
			user = await User.findOne({ facebook_login : user_info.facebook_login }).exec();
		}
		if (type == 'google') {
			user = await User.findOne({ google_login : user_info.google_login }).exec();
		}
		if (type == 'create') {
			user = await User.findOne({ email : user_info.email }).exec();
		}
	} catch(err) {
		return done(err);
	}
	if (!user) {
		try {
			user = await User.create(user_info);
		} catch(err) {
			console.log(err);
			console.log("Failed to create user. Email already has an account associated with it.");
			return done(null, false);				//Unsure how to handle this error. Causes mongoDB to fail.
		}
		console.log("Created user");
		return done(null, user);
	}
	else {
		if (type == 'create') {
			console.log("User with this email already exists.");
			return done(null, false);
		}
		else {
			console.log("User exists");
		}
		return done(null, user);
	}
}

module.exports = User = mongoose.model('User', UserSchema);