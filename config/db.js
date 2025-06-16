const mongoose = require('mongoose');
require('dotenv').config();

const dburl = process.env.DB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(dburl);
        console.log('MongoDB Connected....');
    } catch (err) {
        console.log("The connection is refused: " + err.message);
        process.exist(1);
    }
}

module.exports = connectDB;