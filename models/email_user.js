const mongoose = require('mongoose');
const User = require('./users');

const EmailUser= User.discriminator("email", new mongoose.Schema({
    password: {
        type: String,
        required: false,
        unique: false,
    }
}));

module.exports = EmailUser;