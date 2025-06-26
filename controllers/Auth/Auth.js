const User = require("../../models/email_user");
const BlacklistToken = require("../../models/BlacklistToken");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const {
    generateToken
} = require("../../functions/jwt");

module.exports.register = async (req, res) => {
    try {
        const name = req.body.name;
        const infoContact = req.body.infoContact;
        const password = req.body.password;
        const exists = await User.findOne({
            infoContact
        });
        if (exists) return res.status(409).json({
            message: "هذا الإيمل / رقم الهاتف مستخدم من قبل"
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
            return res.status(404).json({
                message: "المستخدم غير مسجل من قبل"
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
        return rs.status(404).json({
            message: "الترميز غير موجود"
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