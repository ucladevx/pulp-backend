const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

const router = express.Router();

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({ email: email }, function(err, user) {

		})
	}))