const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.generateToken = (user) => {
    return jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    });
};