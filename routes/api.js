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
        first_name:    req.body.first_name,
        last_name:     req.body.last_name,
        photo:         req.body.photo,
        friends:       req.body.friends,
        places:        req.body.places,
        access_token:  req.body.access_token,
        facebook_id:   req.body.facebook_id
    })
    */
    console.log(req.body)
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
    console.log(newUser)
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

//Create new place (only occur once when someone checked in for the first time)
router.post('/create_place', (req, res) => {
  let newPlace = new Place({
      name: req.body.name,
      address: req.body.address,
      averageRating: 0, // Rating is added in add_review
      numRatings: 0,
  })
  newPlace.save((err, place) => {
      if (err) res.status(500).send("Error creating new place")
      console.log("created new place")
      res.send(`New place ${place._id} has been created.`)
  })
})

// Take in the place_id and array of ObjectIds and return the details of the place
// and the weighted rating of the place
router.get('/get_place/:place_id/:fbfriends', async (req, res) => {
  var place = await Place.findById(req.params.place_id);
  var review_ids = place.reviews;
  console.log(review_ids)
  var weightedRating = 0;
  // Cast array of objectIds to strings
  var fbfriends = fbfriends.map(function(friend) {
    return friend["_id"];
  });

  for (var i=0; i < review_ids.length; i++) {
    var review = await Review.findById(review_ids[i]);
    if(fbfriends.includes(review.postedBy.toString()))  // cast ID to string
      weightedRating += 1.5 * review.rating;
    else
      weightedRating += review.rating;
  }
  place.averageRating = weightedRating/place.numRatings;
  res.json(place);
})

module.exports = router;
