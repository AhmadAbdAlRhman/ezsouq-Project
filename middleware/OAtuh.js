const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports.authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({message:'Unauthorized'});
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }catch(err){
        return res.status(401).json({message: 'Invalid token'});
    }
}