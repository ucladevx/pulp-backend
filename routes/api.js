const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

// Insert new user into database
router.post('/new_user', async (req, res) => {

    let friends_facebook_ids = req.body.friends;    // array of friends' FB id's
    let friends_pulp_ids = [];                      // array of friends' Pulp id's

    for (let i = 0; i < friends_facebook_ids.length; i++) {
        await User.findOne({ facebook_id: friends_facebook_ids[i] }, (err, friend) => {
            if (err) {
                console.log(`New user's fb friend (${friends_facebook_ids[i]}) was not found in DB`)
            } else {
                friends_pulp_ids.push(friend._id)
            }
        })
    }

    // Get user info from req.body
    let newUser = new User({
        first_name:    req.body.first_name,
        last_name:     req.body.last_name,
        photo:         req.body.photo,
        friends:       friends_pulp_ids,
        places:        [],
        access_token:  req.body.access_token,
        facebook_id:   req.body.facebook_id
    })

    // Save new user
    newUser.save((err, user) => {
        if (err) res.status(500).send("Error saving user: " + err);
        console.log("saved new user");
        res.send(newUser._id);
    })

    // Add new user to each of new_user's friends already on the app
    User.updateFriends(newUser);
})

// Find user by ID
router.get('/find_user/:user_id', (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if (err) res.status(500).send("Error finding user");
        res.json(user);
    })
})

// Delete user by ID
router.get('/delete_user/:user_id', (req, res) => {
    User.remove({_id: req.params.user_id}, (err) => {
        if (err) res.status(500).send("Error deleting user: " + err);
        res.send('User has been destroyed.');
    })
})

// Edit existing user
router.post('/edit_user', async (req, res) => {
    var user = await User.findById(req.body.user_id);
    const keys = Object.keys(req.body);
    for (const key of keys){
      if(!(user[key] === undefined)){
        user[key] = req.body[key];
      }
    }
    await user.save();
    res.send(`User ${user._id} has been successfully edited.`);
})

module.exports = router;
