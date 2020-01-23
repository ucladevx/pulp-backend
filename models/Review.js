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
    rating: {
        type: Number,
        required: true
    },
    body: {
        type: String,
        required: false
    },
    user_photo: {
      type: String,
      required: true
    }
});

module.exports = Review = mongoose.model('Review', ReviewSchema);
