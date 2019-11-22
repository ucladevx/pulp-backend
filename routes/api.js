const express = require('express');
const request = require('supertest');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

router.get('/', (req, res) => {
  res.send('hello world v2')
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

router.post('/edit_place', async (req, res) => {
  console.log("in edit place")
  var place = await Place.findById(req.body.place_id);
  console.log(place);
  console.log(Object.keys(req.body));
  const keys = Object.keys(req.body);
  for (const key of keys){
    console.log(key);
    if(!(place[key] === undefined)){
      place[key] = req.body[key];
    }
  }
  await place.save();
  res.send(`Place ${place._id} has been successfully edited.`);
})


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
      reviews: []
  })
  newPlace.save((err, place) => {
      if (err) res.status(500).send("Error creating new place")
      console.log("created new place")
      res.send(`New place ${place._id} has been created.`)
  })
})

// Take in the place_id and array of fbfriends and return the details of the place
// and the weighted rating of the place
router.get('/get_place', async (req, res) => {
    var place = await get_place(req.body.place_id, req.body.fbfriends);
    res.json(place);
})

// The logic behind get_place api route.
async function get_place(place_id, fbfriends) {
  var place = await Place.findById(place_id);
  var review_ids = place.reviews;

  var weightedRating = 0;
  var weights = 0;

  for (var i=0; i < review_ids.length; i++) {
    var review = await Review.findById(review_ids[i]);
    if(fbfriends.includes(review.postedBy.toString())) { // cast ID to string
      weightedRating += 1.5 * review.rating;
      weights += 1.5;
    }
    else {
      weightedRating += review.rating;
      weights += 1;
    }
  }
  place.averageRating = weightedRating/weights;
  return place;
}

// Returns the Place object if place exists or null if it doesn't
// The request body should contain place_name and an array of fbfriends.
router.get('/search_place_if_exists', async (req, res) => {
  var cursor = await Place.find( {name: req.body.place_name } );
  if(cursor.length == 0) {
    console.log("Place not found");
    res.send(null);
  }
  cursor.forEach(async function(place) {
    var customized_place = await get_place(place._id, req.body.fbfriends);
    res.json(customized_place);
  });
})

module.exports = router;
