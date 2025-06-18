const User = require("../../models/email_user");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const {
    generateToken
} = require("../../functions/jwt");

// Register
module.exports.register = async (req, res) => {
    try {
        console.log(req.body);
        const name = req.body.name;
        const infoContact = req.body.infoContact;
        const password = req.body.password;
        const exists = await User.findOne({
            infoContact
        });
        if (exists) return res.status(400).json({
            message: "User already exists"
        });

        const user = await User.create({
            name,
            infoContact,
            password
        });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            token: generateToken(user)
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};

// Login
module.exports.login = async (req, res) => {
    try {
        const {
            infoContact,
            password
        } = req.body;

        const user = await User.findOne({
            infoContact
        });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            token: generateToken(user)
        });
    } catch (err) {
        res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};