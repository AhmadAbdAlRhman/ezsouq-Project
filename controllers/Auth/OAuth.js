require('dotenv').config();
const axios = require("axios");
const User = require('../../models/google_user');
const jwt = require('jsonwebtoken');
const qs = require('querystring');

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

        // ✅ البحث باستخدام googleId أو الإيميل
        let user = await User.findOne({
            $or: [{
                    googleId: id
                },
                {
                    infoContact: email
                }
            ]
        });

        if (!user) {
            user = await User.create({
                googleId: id,
                name: name,
                infoContact: email,
                avatar: picture,
                Role: 'USER'
            });
        } else {
            res.status(400).json({
                message: "الإيميل مسجل من قبل عن طريق كلمة المرور"
            });
        }

        const token = generateToken(user);

        res.json({
            message: "تمت المصادقة عن طريق ال جوجل",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.infoContact,
                avatar: user.avatar
            }
        });

    } catch (err) {
        console.error('OAuth Error:', err ?.response ?.data || err.message);
        res.status(500).json({ error: 'فشلت المصادقة مع Google' });
    }
};

