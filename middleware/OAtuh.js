const jwt = require('jsonwebtoken');
const BlacklistToken = require("../models/BlacklistToken");
require('dotenv').config();
module.exports.protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(40).json({
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
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {
            id: decoded.id
        };
        next();
    } catch (err) {
        res.status(401).json({
            meesage: `${err.message}`
        })
    }
}