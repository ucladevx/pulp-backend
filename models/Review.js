const mongoose = require("mongoose");

var ReviewSchema = new mongoose.Schema({
    dateCreated: {
        type: Date,
        index: true,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    place: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Place',
        index: true
    },
    address: {
        type: String,
        index: true,
        required: true
    },
    rating: {
        type: Number,
        min: 0, 
        max: 5,
    },
    body: {
        type: String,
        required: false
    }
});

module.exports = Review = mongoose.model('Review', ReviewSchema);
