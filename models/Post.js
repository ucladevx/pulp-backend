const mongoose = require("mongoose");

var PostSchema = new mongoose.Schema({
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
    user_photo: {
        type: String,
    },
    body: {
        type: String,
        required: false
    },
    tags:{
        type: [String],
    },
    suggested_places: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    }]
});

module.exports = Post = mongoose.model('Post', PostSchema);
