require('dotenv').config();
const axios = require("axios");
const User = require('../../models/google_user');
const jwt = require('jsonwebtoken');
const qs = require('querystring');

const {
    generateToken
} = require("../../functions/jwt");

module.exports.login = (_req, res) => {
    const redirectUri = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI);
    const scope = encodeURIComponent('profile email');
    const url =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
        `&redirect_uri=${redirectUri}` +
        `&response_type=code` +
        `&scope=${scope}`;
    res.redirect(url);
}


module.exports.callback = async (req, res) => {
    const code = req.query.code;
    try {
        // 1. Exchange code for access token
        const tokenRes = await axios.post(
            'https://oauth2.googleapis.com/token',
            qs.stringify({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

        const {
            access_token
        } = tokenRes.data;

        // 2. Get user info
        const userRes = await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                },
            }
        );

        const {
            id,
            name,
            email,
            picture
        } = userRes.data;

        // 3. Store or update user in MongoDB
        let user = await User.findOne({
            googleId: id
        });
        if (!user) {
            user = await User.create({
                googleId: id,
                name: name,
                infoContact: email,
                avatar: picture,
            });
        }

        const token = generateToken(user);

        // 5. Send token as cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // set to true with HTTPS in production
        });
        res.send(`It's Done`);
    } catch (err) {
        console.error('OAuth Error:', err.response ?.data || err.message);
        res.status(500).send('Authentication failed');
    }
}

module.exports.getProfile = async (req, res) => {
    const user = await User.findBYId(req.body.userid);
    if (!user)
        return res.status(404).json({
            message: 'User not found'
        });
    res.json(user);
}