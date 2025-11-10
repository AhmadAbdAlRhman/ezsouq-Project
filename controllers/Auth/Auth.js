const User = require("../../models/users");
const BlacklistToken = require("../../models/BlacklistToken");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const {
    registerSchema
} = require("../../validation/user");
const {
    loginSchema
} = require("../../validation/user");
require('dotenv').config();
const {
    generateToken
} = require("../../functions/jwt");

module.exports.register = async (req, res) => {
    try {
        const {
            error
        } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'fail',
                message: error.details[0].message
            });
        }
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        let user = await User.findOne({
            email
        });
        if (user) {
            if (!user.password) {
                user.password = password;
                user.name = user.name || name;
                await user.save();
            } else {
                return res.status(400).json({
                    message: "هذا البريد مستخدم مسبقًا"
                });
            }
        } else {
            user = await User.create({
                name,
                email,
                password,
                Role: 'USER',
                tokenVersion: 0
            });
        }
        res.status(201).json({
            message: "تم إنشاء المستخدم بنجاح",
            _id: user._id,
            name: user.name,
            Role: user.Role,
            token: generateToken(user)
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء تسجيل الدخول",
            error: err.message
        });
    }
};

module.exports.login = async (req, res) => {
    try {
        const {
            error
        } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 'fail',
                message: error.details[0].message
            });
        }

        const {
            email,
            password
        } = req.body;
        const user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                message: "المستخدم غير مسجل من قبل"
            });
        } else if (user.Role === 'BANNED') {
            return res.status(403).json({
                message: "المسؤول هذا الإيميل محظور من قبل "
            });
        } else if (user.googleId && !user.password) {
            return res.status(400).json({
                message: "Google هذا الإيميل مستخدم من قبل، سجّل دخولك بحساب"
            });
        } else if (!(await user.matchPassword(password))) {
            return res.status(401).json({
                message: "كلمة المرور غير صحيحة"
            });
        }
        res.json({
            message: "تم تسجيل الدخول بنجاح",
            user: {
                _id: user._id,
                name: user.name,
                Role: user.Role,
            },
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

module.exports.delete_account = async (req, res) => {
    try {
        const id = req.user.id;
        if (!id) {
            return res.status(400).json({
                message: "لم يتم إرسال المعرّف المطلوب"
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        }
        const delete_account = await User.findByIdAndDelete(id);
        if (!delete_account) {
            return res.status(404).json({
                message: "لا يوجد مثل هذا المستخدم"
            });
        }
        res.status(200).json({
            message: "تم حذف الحساب بنجاح",
            deletedUser: {
                id: deletedAccount._id,
                email: deletedAccount.email,
                name: deletedAccount.name
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء حذف الحساب",
            Error: err.message
        })
    }
}