const express = require('express');
const router = express.Router();
var request = require('request');

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

/*
Query the Google Places API by place, text, and location.
For place, if response.place_id matches the place_id of an object in database, return document. Else, create new document with default values, save to database, and return that instead.
For text and location, loop through all retults generated and repeat what you did for place.
*/

router.get('/place/:name', (req, res) => {
  var key = "AIzaSyANm7uhb_u9uBUXYL9hwM1mtKa2eN8QS6k";
  var name = req.params.name;
  var url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input="+name+"&inputtype=textquery&fields=name,formatted_address,place_id,user_ratings_total&key="+key;
  request(url, (error, response, body) => {
    if (error || response.statusCode != 200) { res.status(404).send("No matching results."); }
    Place.findOne({place_id: response.place_id}, (err, db_place) => {
      if (err) { res.status(500).send("Error finding place in database."); }
      if (!db_place) {
        var new_place = Place.create({name: response.name, address: response.formatted_address, place_id: response.place_id, average_rating: response.user_ratings_total, thumbsUpCount: 0, thumbsDownCount: 0, thumbsUpIds: [], thumbsDownIds: [], reviews: []});
        res.send(new_place);
      }
      res.send(db_place);
    });
  });

router.get('/text/:query', (req, res) => {
  var key = "AIzaSyANm7uhb_u9uBUXYL9hwM1mtKa2eN8QS6k";
  var query = req.params.query;
  var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query="+query+"&key="+key;
  request(url, (error, response, body) => {
    if (error || response.statusCode != 200) { res.status(404).send("No matching results."); }
    var places = new Array();
    response.results.forEach((result) => {
      Place.findOne({place_id: result.place_id}, (err, db_place) => {
        if (err) { res.status(500).send("Error finding place in database."); }
        if (!db_place) {
          var new_place = Place.create({name: response.name, address: response.formatted_address, place_id: response.place_id, average_rating: response.user_ratings_total, thumbsUpCount: 0, thumbsDownCount: 0, thumbsUpIds: [], thumbsDownIds: [], reviews: []});
          places.push(new_place);
        }
        else { places.push(db_place) };
      });
    });
    res.send(places);
  });
});

router.get('/location/:lat_long/:radius', (req, res) => {
  var key = "AIzaSyANm7uhb_u9uBUXYL9hwM1mtKa2eN8QS6k";
  var lat_long = req.params.lat_long;
  var radius = req.params.radius;
  var url = "https://maps.googleapis.com/maps/api/place/textsearch/json?location="+lat_long+"&radius="+radius+"&key="+key;
  request(url, (error, response, body) => {
    if (error || response.statusCode != 200) { res.status(404).send("No matching results."); }
    var places = new Array();
    response.results.forEach((result) => {
      Place.findOne({place_id: result.place_id}, (err, db_place) => {
        if (err) { res.status(500).send("Error finding place in database."); }
        if (!db_place) {
          var new_place = Place.create({name: response.name, address: response.formatted_address, place_id: response.place_id, average_rating: response.user_ratings_total, thumbsUpCount: 0, thumbsDownCount: 0, thumbsUpIds: [], thumbsDownIds: [], reviews: []});
          places.push(new_place);
        }
        else { places.push(db_place) };
      });
    });
    res.send(places);
  });
});
