const mongoose = require("mongoose");
const LikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: true
    },
}, {
    timestamps: true
});

module.exports = mongoose.model("Likes", LikeSchema);