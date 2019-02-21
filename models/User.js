const mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        required: true
    },
    email: {
        type: String,
        index: true,
        required: true,
        unique: true,
        dropDups: true
    },
    dateJoined: {
        type: Date,
        index: true,
        required: true
    }
});

module.exports = User = mongoose.model('User', UserSchema);