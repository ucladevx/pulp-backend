const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

router.get('/', (req, res) => {
  res.send('hello world')
})

//Insert new user into database
router.post('/new_user', (req, res) => {
    console.log("in new user");
    /*
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        dateJoined: Date.now()
    })
    */
    console.log(req.body)
    console.log(req.body.first_name);
    console.log(req.body.last_name);
    console.log(req.body.email);
    let newUser = new User({
      first_name: req.body.first_name,
    	last_name: req.body.last_name,
    	profile_name: "xeliot334",
    	birthday: "00/00/0000",
    	gender: "M",
    	school: "d",
    	email: req.body.email,
    	facebook_login: "facebook_login",
    	accessToken: "access_token",
    	//google_login: String,
    	//password: String,
    	interests: ["interest1", "interest2"],
    	friends: ["friend1", "friend2"]
    })
    newUser.save((err, user) => {
        if (err) res.status(500).send("Error saving user");
        //console.log("saved new user");
          res.send(`New user ${user._id} has been saved.`);
        //res.send('new user has been saved.');
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

/*
router.post('/edit_place', (req, res) => {
  console.log("in edit place")
  Place.find({name: req.body.name}, function (err, docs) {
    console.log(docs);
    place = docs[0];
    console.log(place);
    console.log(place.)
  });
})
*/

router.post('/add_review', async (req, res) => {
  console.log("in add review");
  var today = new Date();

  var place = await Place.findById(req.body.place_id);
  console.log(place);

  let newReview = new Review({
    dateCreated: today,
    postedBy: req.body.user_id,
    place: req.body.place_id,
    rating: req.body.rating,
    body: req.body.body
  })
  console.log(newReview);
  newReview.save(async (err, review) => {
      if (err) res.status(500).send("Error saving review");
      //console.log("saved new user");
      place.reviews.push(review._id);
      var newRating = ((place.averageRating * place.numRatings) + req.body.rating) / (place.numRatings + 1);
      place.averageRating = newRating;
      place.numRatings += 1;
      await place.save();
      res.send(`New review ${review._id} has been saved.`);
      //res.send('new user has been saved.');
  })
})

module.exports = router;
