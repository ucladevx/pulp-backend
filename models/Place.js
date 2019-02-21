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
    averageRating: {
        type: Number,
        min: 0, 
        max: 5,
        index: false
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Review'
    }]
});

module.exports = Place = mongoose.model('Place', PlaceSchema);
