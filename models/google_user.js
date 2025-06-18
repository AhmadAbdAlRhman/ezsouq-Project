const mongoose = require('mongoose');
const User = require('./users');

const GoogleUser = User.discriminator("google", new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
    },
}));

module.exports = GoogleUser;