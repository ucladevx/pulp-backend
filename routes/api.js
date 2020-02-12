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
AWS.config.update({region:'us-west-2', endpoint: "http://localhost:8000"});
//AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB();

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
        KeyConditionExpression:     "table_id = :v1",
        ExpressionAttributeValues:  { ":v1": { N: table_id_p } }
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

// decrement len of table with table_id = table_id_p (from above constants).
// returns a Promise. Passes nothing upon success, err on failure.
// should never decrement TABLES_DATA.
async function decrement_table_len(table_id_p) {
    var update_params = {
        TableName:                  "Tables_Data",
        Key:                        { table_id: { N: table_id_p } },
        UpdateExpression:           "set len = len - :one",
        ExpressionAttributeValues:  { ":one": { N: "1" } }
    };
    return new Promise((resolve, reject) => {
        dynamodb.updateItem(update_params, function(err, data) {
            if (err)    { return reject(err); }
            else        { resolve(); }
        });
    })
}

// looks for pulp user with facebook id facebook_id.
// returns a Promise. Passes pulp_id or null upon success, err on failure.
async function get_pulp_id(facebook_id) {
    var params = {
        TableName: "Users",
        IndexName: "facebook_id_index",
        KeyConditionExpression: "facebook_id = :value",
        ExpressionAttributeValues: { ":value": {S: facebook_id}, }
    };
    return new Promise((resolve, reject) => {
        dynamodb.query(params, (err, friend) => {
            if (err) { return reject(err); }
            else {
                if (friend.Items.length != 0)   { resolve(friend.Items[0].user_id.N); }
                else                            { resolve(null); }
            }
        })
    });
}

// converts array of facebook IDs to array of pulp IDs.
// returns a Promise. Passes new array upon success, err on failure.
async function convert_to_pulp_ids(facebook_ids) {
    return new Promise((resolve, reject) => {
        let pulp_ids = [];
        if (facebook_ids.length != 0) {
            get_pulp_id(facebook_ids[0])
            .then((pulp_id) => {
                if (pulp_id != null)    { pulp_ids.push(pulp_id.toString()); }
                else                    { console.log(`Could not find a pulp user with facebook id = ${facebook_ids[0]}`); }

                // recursively call on tail
                convert_to_pulp_ids(facebook_ids.slice(1))
                .then((rest) => {
                    pulp_ids.push(...rest);
                    resolve(pulp_ids);
                })
                .catch((err) => { return reject(err); })
            })
            .catch((err) => { return reject(err); });
        } else {
            resolve(pulp_ids);
        }
    });
}

// for each friend of the new user (stored in friends_pulp_ids), add the new user (id = new_user_id) to that friend's friends attribute.
// returns a Promise. Passes nothing on success, err on failure.
async function update_friends(new_user_id, friends_pulp_ids) {
    return new Promise((resolve, reject) => {
        if (friends_pulp_ids.length == 0) {
            resolve();
        } else {
            let friend_id = friends_pulp_ids[0];

            // if user_id is 0, just skip it and continue
            if (friend_id == "0") {
                update_friends(new_user_id, friends_pulp_ids.slice(1))
                .then(() => { resolve() })
                .catch((err) => { return reject(err) });
            } else {
                let update_params = {
                    TableName: "Users",
                    Key: { "user_id": { N: friend_id }},
                    UpdateExpression: "add friends :new_user_id_s",
                    ExpressionAttributeValues: { ":new_user_id_s": { NS : [new_user_id] } },
                    ReturnValues: "ALL_NEW"
                }

                console.log(JSON.stringify(update_params));

                dynamodb.updateItem(update_params, (err, user) => {
                    if (err) { return reject(err); }
                    else {
                        // call it recursively on the tail
                        update_friends(new_user_id, friends_pulp_ids.slice(1))
                        .then(() => { resolve(); })
                        .catch((err) => { return reject(err); });
                    }
                });
            }
        }
    });
}

/////////////////////////////////////////////////
//////////////   USER ENDPOINTS   ///////////////
/////////////////////////////////////////////////

// Insert new user into database
router.post('/new_user', async (req, res) => {
    let friends_facebook_ids = req.body.friends;    // array of friends' FB id's
    let friends_pulp_ids = ["0"];                   // array of friends' Pulp id's

    // get the length of the Users table to calculate new user's pulp id
    get_table_len(USERS)
    .then((length) => {
        let new_id = (parseInt(length, 10) + 1).toString();

        // convert inputted facebook IDs to internal pulp IDs and store in friends_pulp_ids
        convert_to_pulp_ids(friends_facebook_ids)
        .then((pulp_ids) => {
            friends_pulp_ids.push(...pulp_ids);

            var user = {
                TableName: "Users",
                Item: {
                    "user_id" :     {N: new_id},
                    "first_name":   {S: req.body.first_name},
                    "last_name":    {S: req.body.last_name},
                    "photo":        {S: req.body.photo},
                    "friends":      {NS: friends_pulp_ids},     // list of friends' pulp db id's
                    "places":       {NS: ["0"]},                // list of visited places' pulp db id's. Initialize to just hold 0.

                    // Auth info (unsure whether they are needed, but storing just in case for now)
                    "access_token": {S: req.body.access_token},    // I don't think this will be needed bc no need to query facebook after initial setup, but keep for now
                    "facebook_id":  {S: req.body.facebook_id}
                },
                ReturnConsumedCapacity: "TOTAL"
            }
            dynamodb.putItem(user, (err, data)=> {
                if (err) {
                    console.log(`err in putItem --> ${err}`)
                    res.status(500).send(`Error adding new user --> ${err}`)
                } else {
                    console.log(`New user has been created.`);

                    // increment len of table with table_id = USERS bc added user into it
                    increment_table_len(USERS)
                    .then(() => {
                        // update new user's friends
                        update_friends(new_id, friends_pulp_ids)
                        .then(() => { res.send(`New user (${new_id}) has been created.`); })
                        .catch((err) => { res.status(500).send(`update_friends failed --> ${err}`); });
                    })
                    .catch((err) => { res.status(500).send(`Increment table failed in new_user --> ${err}`); });
                }
            })
        })
        .catch((err) => { res.status(500).send(`Unable to convert facebook IDs to pulp IDs --> ${err}`); });
    })
    .catch((err) => { res.status(500).send(`Error getting Users table length from Tables_Data --> ${err}`); });
})

// Find user by ID
router.get('/find_user', (req, res) => {
    var user_params = {
        TableName:                  "Users",
        KeyConditionExpression:     "user_id = :v1",
        ExpressionAttributeValues:  { ":v1": { N: req.query.user_id } }
    };
    dynamodb.query(user_params, async (err, user) => {
        if (err) {
            res.status(500).send(`Error finding user --> ${err}`);
        } else {
            if (user.Count == 0) {
                res.status(500).send(`No user with user_id = ${req.query.user_id}`);
            } else {
                res.json(user.Items[0]);
            }
        }
    });
})

// Delete user by ID
router.get('/delete_user', (req, res) => {
    var params = {
        Key: { "user_id": { N: req.query.user_id } },
        ReturnValues: "ALL_OLD",
        TableName: "Users"
    };
    dynamodb.deleteItem(params, function(err, user) {
        if (err) {
            res.status(500).send(`Error deleting user: " + ${err}`);
        } else {
            // if dynamo found the user and deleted it
            if ('Attributes' in user) {
                // NEED to remove this user from every other user that has it in its friends list

                // decrement table len
                decrement_table_len(USERS)
                .then(() => {
                    res.send(`User (${req.query.user_id}) has been destroyed.`);
                })
                .catch((err2) => {
                    res.status(500).send(`Decrement table failed in delete_user --> ${err2}`);
                });
            } else {
                res.status(500).send(`User (${req.query.user_id}) could not be deleted because it did not exist.`);
            }
        }
    });
})

// Edit existing user
router.post('/edit_user', async (req, res) => {

    // check if user exits first?

    let update_params = {
        TableName : "Users",
        Key: { "user_id": { N: req.body.user_id }},
        UpdateExpression : "set first_name = :first_name, last_name = :last_name, photo = :photo, places = :places, access_token = :access_token, facebook_id = :facebook_id",
        ExpressionAttributeValues : {
            ":first_name":      { S:  req.body.first_name },
            ":last_name":       { S:  req.body.last_name },
            ":photo":           { S:  req.body.photo },
            ":places":          { NS: req.body.places },
            ":access_token":    { S:  req.body.access_token },
            ":facebook_id":     { S:  req.body.facebook_id }
            //friends?
        },
        ReturnValues: "ALL_NEW"
    }
    dynamodb.updateItem(update_params, (err, user) => {
        if (err) {
            res.status(500).send(`Could not update user (${req.body.user_id}) --> ${err}`)
        } else {
            res.send(`User ${req.body.user_id} has been successfully edited.`);
        }
    });
})
/*
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



*/
/////////////////////////////////////////////////
//////////////   PLACE ENDPOINTS   //////////////
/////////////////////////////////////////////////

router.post('/add_review', async (req, res) => {

    // get length of Reviews table
    get_table_len(REVIEWS)
    .then((length) => {
        // converts to int, adds one, converts back to string to store as new place's id
        let new_id = (parseInt(length, 10) + 1).toString();

        var today = new Date().toString();
        var params = {
            TableName: "Reviews",
            Item: {
                "review_id":        { N: new_id },
                "date_created":     { S: today },
                "postedBy":         { N: req.body.user_id },
                "place":            { N: req.body.place_id },
                "rating":           { N: req.body.rating },
                "body":             { S: req.body.body },
                "user_photo":       { S: req.body.user_photo },
            },
            ReturnConsumedCapacity: "TOTAL"
        };
        dynamodb.putItem(params, async (err, review) => {
            if (err) {
                res.status(500).send(`Error creating new review --> ${err}`)
            } else {
                // increment len of table with table_id = REVIEWS bc added place into it
                increment_table_len(REVIEWS)
                .then(() => {
                    res.send(`New review (${new_id}) has been created.`)
                })
                .catch((err) => {
                    res.status(500).send(`Increment table failed in add_review --> ${err}`);
                });
            }
        });
    })
    .catch((err) => {
        res.status(500).send(`Error getting Reviews table length from Tables_Data --> ${err}`);
    });
})

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
                "p_name":           { S: req.body.name },
                "image":            { S: req.body.image },
                "city":             { S: req.body.city },
                "p_state":          { S: req.body.state },
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

router.post('/edit_place', async (req, res) => {
    console.log("in edit place");
    console.log(req.body);
    console.log(req.body.tags);
    var params = {
        TableName: "Places",
        Key: { "place_id": { N: req.body.place_id }},
        UpdateExpression: "set p_name = :p_name, image = :image, city = :city, p_state = :p_state, address1 = :address1, address2 = :address2, zip_code = :zip_code, latitude = :latitude, longitude = :longitude, tags = :tags",
        ExpressionAttributeValues:{
            ":p_name":{ S: req.body.name },
            ":image":{ S: req.body.image },
            ":city":{ S: req.body.city },
            ":p_state":{ S: req.body.state },
            ":address1":{ S: req.body.address1 },
            ":address2":{ S: req.body.address2 },
            ":zip_code":{ S: req.body.zip_code },
            ":latitude":{ N: req.body.latitude },
            ":longitude":{ N: req.body.longitude },
            ":tags":{ SS: req.body.tags }
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log(params);
    console.log("Updating the item");
    dynamodb.updateItem(params, function(err, data) {
        if (err) {
            console.error("Unable to edit place; Error JSON: ", JSON.stringify(err, null, 2));
            res.status(500).send(`Error editing place`);
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            res.send(`Place ${req.body.place_id} has been successfully edited.`);
        }
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
