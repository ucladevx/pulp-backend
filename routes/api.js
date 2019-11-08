const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

//Insert new user into database
router.post('/new_user', (req, res) => {
    let newUser = new User({
        first_name:    req.body.first_name,
        last_name:     req.body.last_name,
        photo:         req.body.photo,
        friends:       req.body.friends,
        places:        req.body.places,
        access_token:  req.body.access_token,
        facebook_id:   req.body.facebook_id
    })
    newUser.save((err, user) => {
        if (err) res.status(500).send("Error saving user: " + err);
        console.log("saved new user");
        res.send(`New user ${user._id} has been saved.`);
    })
    //just for testing for now
    //User.updateFriends(newUser);
})

//Find user by ID
router.get('/find_user/:user_id', (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if (err) res.status(500).send("Error finding user");
        res.json(user);
    })
})

//Delete user by ID
router.get('/delete_user/:user_id', (req, res) => {
    User.remove({_id: req.params.user_id}, (err) => {
        if (err) res.status(500).send("Error deleting user: " + err);
        res.send('User has been destroyed.');
    })
})

module.exports = router;
