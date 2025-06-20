const User = require("../../models/email_user");
const BlacklistToken = require("../../models/BlacklistToken");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const {
    generateToken
} = require("../../functions/jwt");

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

module.exports.logout = async (req, res) => {
    const token = req.headers.authorization ?.split(" ")[1];
    if (!token)
        return rs.status(400).json({
            message: "Token required"
        });
    const decoded = jwt.decode(token);
    const expiration = new Date(decoded.exp * 1000);
    await BlacklistToken.create({
        token,
        expiredAt: expiration
    });
    return res.status(200).json({
        message: "Logged out successfully"
    }); 
}