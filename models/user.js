const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Defining User Schema for Different types of login
/*
const reviewSubSchema = new Schema({
	location: String,
	title: String,
	body: String,
	rating: Number
});
*/

const userSchema = new Schema({
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
},
{collection:'users'});

//CREATE THIS FUNCTION
function findOrCreate(user_info) {
	
}

const User = mongoose.model('User', userSchema);
module.exports = User;