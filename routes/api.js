const express = require('express');
const request = require('supertest');
const router = express.Router();

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Post = require('../models/Post');

router.get('/', (req, res) => {
  res.send('hello world v7.0 test on 12th April 2020 ')
})

/////////////////////////////////////////////////
//////////////   USER ENDPOINTS   ///////////////
/////////////////////////////////////////////////

// Insert new user into database
router.post('/new_user', async (req, res) => {

    let friends_facebook_ids = req.body.friends;    // array of friends' FB id's
    let friends_pulp_ids = [];                      // array of friends' Pulp id's

    for (let i = 0; i < friends_facebook_ids.length; i++) {
        await User.findOne({ facebook_id: friends_facebook_ids[i] }, (err, friend) => {
            if (err) {
                console.log(`Error querying for new user's fb friend (${friends_facebook_ids[i]})`)
            } else {
                if (friend) {
                    friends_pulp_ids.push(friend._id)
                } else {
                    console.log(`Could not find a user with fb id ${friends_facebook_ids[i]}`)
                }
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
router.get('/find_user', (req, res) => {
    User.findById(req.query.user_id, (err, user) => {
        if (err) res.status(500).send("Error finding user");
        res.json(user);
    })
})

// Delete user by ID
router.get('/delete_user', (req, res) => {
    User.remove({_id: req.query.user_id}, (err) => {
        if (err) res.status(500).send("Error deleting user: " + err);

        // NEED to remove this user from every other user that has it in its friends list

        res.send('User has been destroyed.');
    })
})

// Edit existing user
router.post('/edit_user', async (req, res) => {
    let user;
    try {
        user = await User.findById(req.body.user_id);
    } catch (err) {
        res.status(500).send("Could not find user");
    }
    if (user) {
        const keys = Object.keys(req.body);
        for (const key of keys) {
            if(!(user[key] === undefined)) {
                user[key] = req.body[key];
            }
        }
        await user.save();
        res.send(`User ${user._id} has been successfully edited.`);
    }
})

// Given user, return list of all unique places (in json object format) that the user's friends have been to
router.get('/get_map', async (req, res) => {
    let user;
    try {
        user = await User.findById(req.query.user_id);
    } catch(err) {
        res.status(500).send("Couldn't find user.")
    }

    if (user) {
        // Get a list of unique place id's that the user's friends have been to
        let place_ids = [];
        let friends = user.friends;
        for (let i = 0; i < friends.length; i++) {
            let friend_id = friends[i];
            try {
                friend = await User.findById(friend_id);
            } catch(err) {
                console.log('Could not find friend in DB');
                continue;
            }
            if (friend) {
                let friend_places = friend.places;
                for (let j = 0; j < friend_places.length; j++) {
                    let place_id = friend_places[j];
                    if (place_ids.includes(place_id.toString())) {
                        continue;
                    }
                    place_ids.push(place_id.toString());
                }
            }
        }

        // use get_place to get data of each place with custom rating for the user
        let list = []
        for (let k = 0; k < place_ids.length; k++) {
            let data = await get_place(place_ids[k], friends);
            if(data)
                list.push(data);
        }
        // Sort the list by average rating first and distance to break the tie
        list.sort((a, b) => (a.averageRating > b.averageRating) ? 1 :
            (a.averageRating === b.averageRating) ? ((a.distance > b.distance) ? 1 : -1) : -1 )
        res.send(list);
    }
})




/////////////////////////////////////////////////
//////////////   PLACE ENDPOINTS   //////////////
/////////////////////////////////////////////////

// Edit existing place
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
  var user = await User.findById(req.body.user_id);
  console.log(user);

  let newReview = new Review({
    dateCreated: today,
    postedBy: req.body.user_id,
    place: req.body.place_id,
    rating: req.body.rating,
    body: req.body.body,
    user_photo: req.body.user_photo
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

  user.places.push(req.body.place_id);
  await user.save();
})

//Create new place (only occur once when someone checked in for the first time)
router.post('/create_place', (req, res) => {
  let newPlace = new Place({
      name: req.body.name,
      image: req.body.image,
      city: req.body.city,
      state: req.body.state,
      address1: req.body.address1,
      address2: req.body.address2,
      zip_code: req.body.zip_code,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      tags: req.body.tags,
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

// Take in the place_id and user_id and return the details of the place
// and the weighted rating of the place
router.get('/get_place', async (req, res) => {
    var user = await User.findById(req.query.user_id);
    if(user == null)
         res.status(500).send("Error user doesn't exist")
    var place = await get_place(req.query.place_id, user.friends);
    res.json(place);
})

// The logic behind get_place api route.
async function get_place(place_id, fbfriends) {
  var place = await Place.findById(place_id);
  if (place == null)
    res.status(500).send("Error place doesn't exist")
  var review_ids = place.reviews;

  var weightedRating = 0;
  var weights = 0;

  var friend_images = [];
  var reviews = []

  for (var i=0; i < review_ids.length; i++) {
    var review = await Review.findById(review_ids[i]);
    reviews.push(review);
    console.log(review);
    if(fbfriends.includes(review.postedBy.toString())) { // cast ID to string
      weightedRating += 1.5 * review.rating;
      weights += 1.5;
      var user = await User.findById(review.postedBy.toString());
      console.log(user);
      console.log(user.photo);
      friend_images.push(user.photo);
    }
    else {
      weightedRating += review.rating;
      weights += 1;
    }
  }
  place.averageRating = weightedRating/weights;
  response = {
      "place": place,
      "averageRating": weightedRating/weights,
      "friend_images": friend_images,
      "reviews": reviews // []
  }
  return response;
}

// Returns the Place object if place exists or null if it doesn't
// The request body should contain place_name and an array of fbfriends.
router.get('/search_place_if_exists', async (req, res) => {
  var cursor = await Place.find( {name: req.query.place_name } );
  if(cursor.length == 0) {
    console.log("Place not found");
    res.send(null);
  }
  var user = await User.findById(req.query.user_id);
  cursor.forEach(async function(place) {
    var customized_place = await get_place(place._id, user.friends);
    res.json(customized_place);
  });
})

////////////////////////////////////////////////
//////////////   POST ENDPOINTS   //////////////
////////////////////////////////////////////////

router.post('/add_post', async (req, res) => {
    console.log("Adding post");
    var today = new Date();

    let newPost = new Post({
      dateCreated: today,
      postedBy: req.body.user_id,
      user_photo: req.body.user_photo,
      body: req.body.body,
      tags: req.body.tags,
      suggested_places: req.body.suggested_places
    })
    console.log(newPost);
    newPost.save(async (err, post) => {
      if (err) res.status(500).send("Error saving post");
      else res.send(`New post ${post._id} has been saved.`);
    })
})

router.get('/get_post', async (req, res) => {
    var post = await Post.findById(req.query.post_id);
    if(post == null)
         res.status(500).send("Error post doesn't exist")
    res.json(post);
})

module.exports = router;
