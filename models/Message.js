// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Message", messageSchema);