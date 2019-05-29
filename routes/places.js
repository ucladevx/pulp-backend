const express = require('express');
const router = express.Router();
var request = require('request');

const mongoose = require('mongoose');
const User = require('../models/User');
const Place = require('../models/Place');

router.get('/search/:query/:location/:radius?', (req, res) => {
  let key = "AIzaSyANm7uhb_u9uBUXYL9hwM1mtKa2eN8QS6k";
  let query = req.params.query;
  let location = req.params.location;
  let radius = ((req.params.radius != null) ? req.params.radius : 25);
  let url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query="+query+"&location="+location+"&radius="+radius+"&key="+key;
  request(url, async (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let places = [];
      let old_place;
      let new_place;
      body = JSON.parse(body);
      for (var result of body.results) {
        try { old_place = await Place.findOne({place_id: result.place_id}); } 
        catch (err) {
            console.log("Error finding place in database.");
            res.status(500).send(err);
        }
        if (!old_place) {
          try { new_place = await Place.create({place_id: result.place_id, name: result.name, address: result.formatted_address, photos: result.photos, checkIns: [], rating: 0, ratings: []}); }
          catch (err) {
            console.log("Error creating new place in database.");
            res.status(500).send(err);
          }
          places.push(new_place);
        }
        else { places.push(old_place); }
      }
      console.log("Places:" + places);
      res.status(200).send(places);
    }
    else { res.status(400).send("Invalid request."); }
  });
});

router.get('/profile/:place_id', async (req, res) => {
  let key = "AIzaSyANm7uhb_u9uBUXYL9hwM1mtKa2eN8QS6k";
  let place;
  try { place = await Place.findOne({place_id: req.params.place_id}); } 
  catch (err) {
      console.log("Error finding place in database.");
      res.status(500).send(err);
  }

  let photo_reference;
  try { photo_reference = place.photo.photo_reference; }
  catch (err) {
    console.log("No photo_reference found for this place.");
    res.status(404).send(err);
  }

  let url = "https://maps.googleapis.com/maps/api/place/photo?photo_reference="+photo_reference+"&maxheight=1600"+"&key="+key;
  request(url, (error, response, body) => {
    body = JSON.parse(body);
    if (!error && response.statusCode == 200) { res.status(200).send({'place': place, 'image': body}); }
    else { res.status(404).send("No image found for this place."); }
  });
});

router.post('/', async (req, res) => {
  let place = await Place.findOne({ place_id: req.body.place_id });
  let updated_place = { 
    checkIns: ((req.body.checkIn != null) ? place.checkIns.push(req.user._id) : place.checkIns),
    rating: ((req.body.rating != null) ? (place.rating + req.body.rating) / (place.ratings.length + 1) : place.rating), 
    ratings: ((req.body.rating != null) ? place.ratings.push(req.user._id) : place.ratings)
  }

  try { let place = await Place.findOneAndUpdate({ place_id: req.body.place_id }, updated_place, { new: true }); }
  catch (err) {
    console.log('Error posting information to place.');
    res.status(400).send(err);
  }
  res.status(200).send("Success.");
});

module.exports = router;