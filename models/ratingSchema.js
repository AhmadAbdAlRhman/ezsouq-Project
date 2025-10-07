const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    publish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    message: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('rating', ratingSchema);