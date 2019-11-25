const mongoose = require("mongoose");

var PlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        required: true
    },
    image: {
        type: String,
    },
    city: {
        type: String,
        required: true
    },
    state: {    
        type: String,
        required: true
    },
    address1: {
        type: String,
        index: true,
        required: false
    },
    address2: {
        type: String,
        index: true,
        required: false
    },
    zip_code: {
        type: String,
        required: false
    },
    latitude: {
        type: Number,
        index: true,
        required: true,
    },
    longitude:{
        type: Number,
        index: true,
        required: true,
    },
    tags:{ 
        type: [String],
        required: true 
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        index: false
    },
    numRatings: {
        type: Number,
        min: 0,
        index: false
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

module.exports = Place = mongoose.model('Place', PlaceSchema);

/*
thumbsUpCount: {
    type: Number,
    min: 0,
    index: false
},
thumbsDownCount: {
    type: Number,
    min: 0,
    index: false
},
thumbsUpIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}],
thumbsDownIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
}],
*/
