const User = require("../../models/email_user");
const BlacklistToken = require("../../models/BlacklistToken");
const jwt = require("jsonwebtoken");
const {registerSchema} = require("../../validation/user");
const {loginSchema} = require("../../validation/user");
require('dotenv').config();
const {
    generateToken
} = require("../../functions/jwt");

module.exports.register = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const exists = await User.findOne({
            email
        });
        if (exists) return res.status(409).json({
            message: "هذا الإيمل مستخدم من قبل"
        });
        const validatedData = await registerSchema.validateAsync(req.body);
        const user = await User.create({
            ...validatedData,
            Role: 'USER'
        });
        res.status(201).json({
            message: "تم إنشاء المستخدم بنجاح",
            _id: user._id,
            name: user.name,
            Role: user.Role,
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
        const validatedData = await loginSchema.validateAsync(req.body);
        const {email, password} = validatedData;
        const user = await User.findOne({
            email
        });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(404).json({
                message: "المستخدم غير مسجل من قبل"
            });
        }
        res.json({
            message: "تم تسجيل الدخول بنجاح",
            _id: user._id,
            name: user.name,
            Role: user.Role,
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
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(404).json({
                message: "الترميز غير موجود أو غير صالح"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({
                message: "الترميز غير صالح"
            });
        }
        const expiration = new Date(decoded.exp * 1000);
        await BlacklistToken.create({
            token,
            expiredAt: expiration
        });
        return res.status(200).json({
            message: "تم تسجيل الخروج بنجاح"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({
            message: "حدث خطأ أثناء تسجيل الخروج"
        });
    }
}