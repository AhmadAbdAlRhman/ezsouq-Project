    require('dotenv').config();
    const axios = require("axios");
    const User = require('../../models/users');
    const jwt = require('jsonwebtoken');
    const qs = require('querystring');
    const {
        OAuth2Client
    } = require('google-auth-library');
    const {
        generateToken
    } = require("../../functions/jwt");
    //This is for appears all account in your device
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
    //This is for login and register by Google
    module.exports.callback = async (req, res) => {
        const code = req.query.code;
        if (!code) {
            return res.status(400).json({
                error: 'Missing "code" in query params'
            });
        }
        try {
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
                }
            );
            const {
                access_token
            } = tokenRes.data;
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
            let user = await User.findOne({
                $or: [{
                        googleId: id
                    },
                    {
                        email: email
                    }
                ]
            });
            if (!user) {
                user = await User.create({
                    googleId: id,
                    name: name,
                    email: email,
                    avatar: picture,
                    Role: 'USER'
                });
            } else {
                if (!user.googleId) {
                    user.googleId = id;
                }
                if (!user.avatar) user.avatar = picture;
                if (!user.name) user.name = name;
                await user.save();
            }
            const token = generateToken(user);
            res.json({
                message: "تمت المصادقة عن طريق ال جوجل",
                token,
                user: {
                    googleId: id,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    Role: user.Role,
                    avatar: user.avatar
                }
            });

        } catch (err) {
            console.error('OAuth Error:', err.message, err.response ?.data);
            res.status(500).json({
                message: 'فشلت المصادقة مع Google',
                Error: err.message
            });
        }
    };

    module.exports.AndroidLogin = async (req, res) => {
        try {
            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const token = req.body.token;
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            const {
                sub,
                email,
                name,
                picture
            } = payload;
            let user = await User.findOne({
                email
            });
            if (user) {
                if (!user.googleId) {
                    user.googleId = sub;
                    user.avatar = user.avatar || picture;
                    user.name = user.name || name;
                    await user.save();

                } else {
                    user = await User.create({
                        googleId: sub,
                        email,
                        name,
                        avatar: picture,
                        Role: 'USER'
                    });
                }
            }
            const tokeny = generateToken(user);
            res.json({
                success: true,
                token: tokeny,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    Role: user.Role,
                    picture: user.avatar,
                },
            });
        } catch (err) {
            console.error("Auth error:", err.message);
            res.status(500).json({
                message: "حدث خطأ أثناء التسجيل ",
                error: err.message
            });
        }
    }