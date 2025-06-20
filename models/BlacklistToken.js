const mongoose = require("mongoose");

const BlacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expiredAt: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model("BlacklistToken", BlacklistTokenSchema);