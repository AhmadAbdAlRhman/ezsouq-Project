const mongoose = require('mongoose');
const User = require('./users');

const EmailUser = User.discriminator("email", new mongoose.Schema({
    password: {
        type: String,
        required: true,
        unique: false,
    },
    resetToken: String,
    resetTokenExpire: Date
}));

module.exports = EmailUser;