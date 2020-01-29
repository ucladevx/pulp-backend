/*

 * NEW API ROUTES USING DYNAMO

*/

const express = require('express');
const request = require('supertest');
const router = express.Router();


// for testing. eventually change to use config file?
var AWS = require("aws-sdk");
AWS.config.update({region:'us-west-2'});
//AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({endpoint: "http://localhost:8000"});

/*
const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
*/

// Table ID Definitions
const TABLES_DATA   = "0";
const USERS         = "1";
const PLACES        = "2";
const REVIEWS       = "3";

// Base endpoint
router.get('/', (req, res) => {
  res.send('hello world v5.4')
})


// get len of table with table_id = table_id_p (from above constants).
// returns a Promise. Passes string of length upon success, err on failure.
async function get_table_len(table_id_p) {
    var table_params = {
        TableName:                  "Tables_Data",
        ExpressionAttributeValues:  { ":v1": { N: table_id_p } },
        KeyConditionExpression:     "table_id = :v1",
    };
    return new Promise((resolve, reject) => {
        dynamodb.query(table_params, async (err, data) => {
            if (err)    { return reject(err); }
            else        { resolve(data.Items[0].len.N); }
        });
    })
}

// increment len of table with table_id = table_id_p (from above constants).
// returns a Promise. Passes nothing upon success, err on failure.
// should never increment TABLES_DATA.
async function increment_table_len(table_id_p) {
    var update_params = {
        TableName:                  "Tables_Data",
        Key:                        { table_id: { N: table_id_p } },
        UpdateExpression:           "set len = len + :one",
        ExpressionAttributeValues:  { ":one": { N: "1" } }
    };
    return new Promise((resolve, reject) => {
        dynamodb.updateItem(update_params, function(err, data) {
            if (err)    { return reject(err); }
            else        { resolve(); }
        });
    })
}

/////////////////////////////////////////////////
//////////////   USER ENDPOINTS   ///////////////
/////////////////////////////////////////////////
/*
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

  // get length of Places table and add one to get new id number
  var table_params = {
      TableName: "Tables_Data",
      ExpressionAttributeValues: {
          ":v1": {
              N: REVIEWS
          }
      },
      KeyConditionExpression: "table_id = :v1",
  };
  dynamodb.query(table_params, function(err, data) {
      if (err) {
          res.status(500).send(err);
      } else {
          let length = data.Items[0].len.N;                       // returns type string from db
          let new_id = (parseInt(length, 10) + 1).toString();     // converts to int, adds one, converts back to string to store
          var today = new Date();

          var params = {
              Item: {
                  "review_id": {
                      N: new_id
                  },
                  "dateCreated": {
                      S: today
                  },
                  "postedBy": {
                      N: req.body.user_id
                  },
                  "place": {
                      N: req.body.place_id
                  },
                  "rating": {
                      N: req.body.rating
                  },
                  "body": {
                      S: req.body.body
                  },
                  "userPhoto": {
                      S: req.body.user_photo
                  }
              },
              ReturnConsumedCapacity: "TOTAL",
              TableName: "Reviews"
          };
          dynamodb.putItem(params, function(err, place) {
              if (err) {
                  res.status(500).send(`Error creating new review --> ${err}`)
              } else {
                  // increment length of table with table_id = PLACES bc adding place into it                     !!!TURN INTO HELPER FUNCTION!!!
                  var update_params = {
                      TableName: "Tables_Data",
                      Key: {
                          table_id: {
                              N: REVIEWS
                          }
                      },
                      UpdateExpression: "set len = len + :one",
                      ExpressionAttributeValues: {
                          ":one": {
                              N: "1"
                          }
                      }
                  };
                  dynamodb.updateItem(update_params, function(err, data) {
                      if (err) {
                          res.status(500).send(`Error updating Places table length in Tables_Data --> ${err}`);
                      } else {
                          res.send(`New review (${new_id}) has been created.`)
                      }
                  });
              }
          });
      }
  })
})
*/
//Create new place (only occur once when someone checked in for the first time)
router.post('/create_place', async (req, res) => {

    // get length of Places table
    get_table_len(PLACES)
    .then((length) => {
        // converts to int, adds one, converts back to string to store as new place's id
        let new_id = (parseInt(length, 10) + 1).toString();

        var params = {
            TableName: "Places",
            Item: {
                "place_id":         { N: new_id },
                "name":             { S: req.body.name },
                "image":            { S: req.body.image },
                "city":             { S: req.body.city },
                "state":            { S: req.body.state },
                "address1":         { S: req.body.address1 },
                "address2":         { S: req.body.address2 },
                "zip_code":         { S: req.body.zip_code },
                "latitude":         { N: req.body.latitude },
                "longitude":        { N: req.body.longitude },
                "tags":             { SS: req.body.tags },
                "averageRating":    { N: "0" },                 // Rating is added in add_review
                "numRatings":       { N: "0" },
                "reviews":          { NS: ["0"] }               // not allowed to be empty!!!       WILL NEED TO FIX
            },
            ReturnConsumedCapacity: "TOTAL"
        };
        dynamodb.putItem(params, async (err, place) => {
            if (err) {
                res.status(500).send(`Error creating new place --> ${err}`)
            } else {
                // increment len of table with table_id = PLACES bc added place into it
                increment_table_len(PLACES)
                .then(() => {
                    res.send(`New place (${new_id}) has been created.`)
                })
                .catch((err) => {
                    res.status(500).send(`Increment table failed in create_place --> ${err}`);
                });
            }
        });
    })
    .catch((err) => {
        res.status(500).send(`Error getting Places table length from Tables_Data --> ${err}`);
    });
})
/*
// Take in the place_id and user_id and return the details of the place
// and the weighted rating of the place
router.get('/get_place', async (req, res) => {
    var user = await User.findById(req.body.user_id);
    if(user == null) {
        res.status(500).send("Error user doesn't exist")
        console.log("user doesn't exist")
    }
    else {
      var place = await get_place(req.body.place_id, user.friends);
      res.json(place);
    }
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
  var cursor = await Place.find({
      name: req.body.name,
      latitude: req.body.latitude,
      longitude: req.body.longitude
  });
  if(cursor.length == 0) {
    console.log("Place not found");
    res.send(null);
  }
  var user = await User.findById(req.body.user_id);
  cursor.forEach(async function(place) {
    var customized_place = await get_place(place._id, user.friends);
    res.json(customized_place);
  });
})
*/
module.exports = router;
