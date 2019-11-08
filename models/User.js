const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Defining User Schema for Different types of login (only handles facebook for now)
var UserSchema = new mongoose.Schema({
    // User info
	first_name: { type: String, required: true },
    last_name:  { type: String, required: true },
    photo:      { type: String, required: true },
    friends:    { type:  [mongoose.Schema.Types.ObjectId,], ref: 'User',  required: true },   // list of friends' pulp db id's
    places:     { type:  [mongoose.Schema.Types.ObjectId,], ref: 'Place', required: true },   // list of visited places' pulp db id's

    // Auth info (unsure whether they are needed, but storing just in case for now)
    access_token:  { type: String, required: true },
    facebook_id:   { type: String, required: true }
});

// type parameter is not needed until we introduce different logins. Leaving it in case we add these again later.
UserSchema.statics.findOrCreate = async function(user_info, type, done) {
	let user;
	try {
		if (type == 'facebook') {	//always true with only facebook
			user = await User.findOne({ facebook_id : user_info.facebook_id }).exec();
		}
		/*
		if (type == 'google') {
			user = await User.findOne({ google_login : user_info.google_login }).exec();
		}
		if (type == 'create') {
			user = await User.findOne({ email : user_info.email }).exec();
		}
		*/
	} catch(err) {
		return done(err);
	}
	if (!user) {
		try {
			user = await User.create(user_info);
		} catch(err) {
			console.log(err);
			console.log("Failed to create user.");
			return done(null, false);
		}
        console.log("Created new user:");
        console.log(user_info);

		return done(null, user);
	}
	else {
		/*
		if (type == 'create') {
			console.log("User with this email already exists.");
			return done(null, false);
		}
		else {
			console.log("User exists");
		}
        */
        console.log("User already exists");
		return done(null, user);
	}
}

// adds new_user to each of new_user's friends' .friends list field in db
//  --> for each user U in new_user.friends: U.friends.add(new_user)
UserSchema.statics.updateFriends = async function(new_user) {
    let new_user_friend = new_user.friends;
    for (let i = 0; i < new_user_friends.length; i++) {
		let new_user_friend;
		try {
            new_user_friend = await User.findById(new_user_friends[i]);
		} catch(err) {
			console.log("Couldn't find friend");
		}
		if (new_user_friend) {
			if (new_user_friend.friends.includes(new_user)) {
				continue;
			}
			new_user_friend.friends.push(new_user)
			try {
                await User.findByIdAndUpdate(new_user_friends[i], new_user_friend, { new: true });
			} catch(err) {
				console.log("failed to update friends list");
			}
		}
	}
}

/* Unneeded since only logging in via facebook?
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
*/

module.exports = User = mongoose.model('User', UserSchema);
