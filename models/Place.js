const mongoose = require("mongoose");

var PlaceSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        required: true
    },
    address: {
        type: String,
        index: true,
        required: true
    },
    place_id: {
        type: String,
        index: true,
        required: false,
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
