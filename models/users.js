const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    second_name: {
        type: String,
        required: false,
    },
    infoContact: {
        type: String,
        required: false,
        unique: true,
    },
    password: {
        type: String,
        required: false,
        unique: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    address: {
        type: String,
        required: false,
    },
    googleId: {
        type: String,
        required: false,
        unique: true,
    },
}, { timestamps: true });

const Users = mongoose.model("Users", UserSchema);
module.exports = Users;