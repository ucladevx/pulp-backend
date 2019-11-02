const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

//Insert new user into database
router.post('/new_user', (req, res) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        dateJoined: Date.now()
    })
    newUser.save((err, user) => {
        if (err) res.status(500).send("Error saving user");
        console.log("saved new user");
        res.send(`New user ${user._id} has been saved.`);
    })
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

//Create a new place (only occur once when someone checked in for the first time)
router.post('/create_place', (req, res) => {
    let newPlace = new Place({
        name: req.body.name,
        address: req.body.address,
        place_id: req.body.place_id,
        averageRating: 0,
        thumbsUpCount: 0,
        thumbsDownCount: 0,
        thumbsUpIds: Array[null],
        thumbsDownIds: Array[null],
        reviews: Array[null],
    })
    newPlace.save((err, place) => {
        if (err) res.status(500).send("Error creating new place")
        console.log("created new place")
        res.send(`New place ${place._id} has been created.`)
    })
})

//Find place by ID
router.get('/find_place/:place_id', (req, res) => {
    Place.findById(req.params.place_id, (err, place) => {
        if (err) res.status(500).send("Error finding place");
        res.json(place)
    })
})

module.exports = router;
