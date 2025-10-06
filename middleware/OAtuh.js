const jwt = require('jsonwebtoken');
const BlacklistToken = require("../models/BlacklistToken");
const User = require("../models/users");
require('dotenv').config();
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(404).json({
            message: "انتهت الجلسة. الرجاء تسجيل الدخول مجدداً"
        });
    const token = authHeader.split(' ')[1];
    const isTokenBlacklisted = await BlacklistToken.findOne({
        token
    });
    if (isTokenBlacklisted)
        return res.status(401).json({
            message: "Token blacklisted"
        });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        if (user.Role === 'BANNED') {
            return res.status(403).json({ message: "تم حظرك من النظام" });
        }
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ message: "انتهت الجلسة. الرجاء تسجيل الدخول مجدداً" });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            meesage: `${err.message}`
        })
    }
}