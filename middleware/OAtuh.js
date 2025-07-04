const jwt = require('jsonwebtoken');
const BlacklistToken = require("../models/BlacklistToken");
require('dotenv').config();
module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(404).json({
            message: "Token missing"
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
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({
            meesage: `${err.message}`
        })
    }
}