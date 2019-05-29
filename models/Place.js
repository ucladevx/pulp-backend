const mongoose = require("mongoose");

var PlaceSchema = new mongoose.Schema({
    place_id: {
        type: String,
        index: true,
        required: true,
    },
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
    photo: Object,
    checkIns: String,
    rating: String,
    ratings: [String]
});

module.exports = Place = mongoose.model('Place', PlaceSchema);