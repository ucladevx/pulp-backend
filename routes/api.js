/*

 * NEW API ROUTES USING DYNAMO

*/
const mongoose = require('mongoose');
//const Place = require('../models/Place');
//const Review = require('../models/Review');

const express = require('express');
const request = require('supertest');
const router = express.Router();
const User = require('../createTables/UsersCreateTable');
const Place = require('../createTables/PlacesCreateTable');
const Review = require('../createTables/ReviewsCreateTable');
var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});
var dynamodb = new AWS.DynamoDB({endpoint: "http://localhost:8000"});

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

// Insert new user into database
router.post('/new_user', async (req, res) => {
    console.log(req.body);
    let friends_facebook_ids = req.body.friends;    // array of friends' FB id's
    let friends_pulp_ids = ["dummystring"];                      // array of friends' Pulp id's

    get_table_len(USERS).then((length) => {
        let new_id = (parseInt(length, 10) + 1).toString();
        for (let i = 0; i < friends_facebook_ids.length; i++) {
            var params = {
                TableName: "Users",
                IndexName: "facebook_id_index",
                KeyConditionExpression: "#key = :value",
                ExpressionAttributeNames: {
                    "#key":  "facebook_id"
                },
                ExpressionAttributeValues: {
                    ":value": {S: friends_facebook_ids[i]},
                }
            };
            dynamodb.query(params, (err, friend) => {
                if (err) {
                    res.status(500).send(`Error querying for new user's fb friend (${friends_facebook_ids[i]}) --> ${err}`);
                } else {
                    console.log(friend);
                    if (friend.Items.length!=0) {
                        friends_pulp_ids.push(friend.Items[0].facebook_id.S);
                        console.log(friends_pulp_ids);
                    } else {
                        console.log(`Could not find a user with fb id ${friends_facebook_ids[i]}`)
                    }
                }
            })
        }

        var user = {
            TableName: "Users",
            Item: {
                "user_id" : {N: new_id},
                "first_name": {S: req.body.first_name},
                "last_name": {S: req.body.last_name},
                "photo": {S: req.body.photo},
                "friends": {SS: friends_pulp_ids},   // list of friends' pulp db id's
                "places": {SS: req.body.places},   // list of visited places' pulp db id's

                // Auth info (unsure whether they are needed, but storing just in case for now)
                "access_token": {S: req.body.access_token},    // I don't think this will be needed bc no need to query facebook after initial setup, but keep for now
                "facebook_id": {S: req.body.facebook_id}
            }
        }

        dynamodb.putItem(user, (err, data)=> {
            if (err) {
                res.status(500).send(`Error add new user --> ${err}`)
            } else {
                // increment len of table with table_id = PLACES bc added place into it
                increment_table_len(USERS)
                    .then(() => {
                        console.log(`New user (${new_id}) has been created.`);
                    })
                    .catch((err) => {
                        res.status(500).send(`Increment table failed in create_place --> ${err}`);
                    });
            }
        })

        for(let i = 1; i < friends_pulp_ids.length; i++){
            var params = {
                TableName:"Users",
                IndexName:"facebook_id_index",
                KeyConditionExpression: "facebook_id = :value",
                ExpressionAttributeValues: {
                    ":value": {S: friends_pulp_ids[i]},
                }
            };
            dynamodb.query(params, (err, friend) => {
                if (err) {
                    res.status(500).send(`Error in reaching the facebook friend --> ${err}`);
                } else {
                    if (friend.Items[0]!= 0) {
                        var update = {
                            TableName:"Users",
                            UpdateExpression:"set friends = list_append(friends, :l)",
                            ExpressionAttributeValues:{
                                ":l": friend.Items[0].facebook_id.S,
                            },
                            ReturnValues : "UPDATE_NEW"
                        };
                        console.log("Updating the item...");
                        dynamodb.update(update, function(err, data) {
                            if (err) {
                                console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("Success");
                            }
                        });

                    } else {
                        console.log(`Could not find a user with fb id ${friends_facebook_ids[i]}`);
                    }
                }
            })

        }
        res.send(`New user (${new_id}) has been created.`);

    }).catch((err) => {
        res.status(500).send(`Error getting Users table length from Tables_Data --> ${err}`);
    });


})



    // Add new user to each of new_user's friends already on the app
/*

    for(let i = 0; i < friends_pulp_ids.length; i++){
        var params = {
            TableName:"Users",
            IndexName:"facebook_id_index",
            KeyConditionExpression: "facebook_id = :value",
            ExpressionAttributeValues: {":value":{ S: friends_pulp_ids[i] }}
        };
        await docClient.query(params, (err, friend) => {
            if (err) {
                console.log("Error in reaching pulp friend, ",JSON.stringify(err, null, 2));
            } else {
                if (friend) {
                    var update = {
                        TableName:"Users",
                        UpdateExpression:"set friends = list_append(friends, :l)",
                        ExpressionAttributeValues:{
                            ":l": friend.user_id,
                        },
                        ReturnValues : "UPDATE_NEW"
                    };
                    console.log("Updating the item...");
                    docClient.update(update, function(err, data) {
                        if (err) {
                            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                        }
                    });

                } else {
                    console.log(`Could not find a user with fb id ${friends_facebook_ids[i]}`);
                }
            }
        })

    }
})

//Find user by IDnd
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
});
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
