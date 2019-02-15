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
	accounts: [
		{
			kind: String, 		//facebook
			uid: String
		},
		{
			kind: String, 		//internal
			username: String,
			password: String
		},
		{
			kind: String, 		//google
			uid: String
		}
	]
});

const User = mongoose.model('User', userSchema);
module.exports = User;