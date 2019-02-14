const express = require('express');
const router = express.Router();

const mongoHelper = require('../mongoHelper');
const ObjectId = require('mongodb').ObjectId; 

const db = mongoHelper.getDb();

//Insert new user into database
router.post('/new_user', (req, res) => {
    let newUser = { name: req.body.name, email: req.body.email, age : req.body.age }
    db.collection("users").insertOne(newUser, (err, obj) => {
        if (err) {
            res.status(500).send("Error in saving new user.");
        } else {
            console.log('asdjflkds', obj.ops);
            res.send(`New user ${obj.ops[0]._id} has been saved.`);
        }
    })
})

//Find user by ID
router.get('/find_user/:user_id', (req, res) => {
    db.collection("users").findOne({ _id: ObjectId(req.params.user_id) }, (err, obj) => {
        if (err) {
            res.status(500).send("Error fetching user: " + err);
        } else {
            res.json(obj);
        }
    })
})

//Delete user by ID
router.get('/delete_user/:user_id', (req, res) => {
    db.collection("users").deleteOne({ _id: ObjectId(req.params.user_id) }, (err, obj) => {
        if (err) {
            res.status(500).send("Error deleting user: " + err);
        } else {
            res.send('User has been destroyed.');
        }
    })
})

module.exports = router;
