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
    body: {
        type: String,
        required: false
    }
});

module.exports = Review = mongoose.model('Review', ReviewSchema);
