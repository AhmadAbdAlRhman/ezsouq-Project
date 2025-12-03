const User = require("../../models/users");
const BlacklistToken = require("../../models/BlacklistToken");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
let tempRegistrations = new Map();
const crypto = require('crypto');
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
const {
    cleanPhone
} = require('../../functions/cleanPhone');
const {
    sendWhatsAppCode
} = require("../../servers/sendWhatsAppCode");
const { sendEmail } = require("../../servers/sendEmailCode");

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
        const phone = req.body.phone;
        const password = req.body.password;
        if (!name || !password || (!email && !phone)) {
            return res.status(400).json({
                message: "يجب إدخال جميع الحقول المطلوبة"
            });
        }
        let cleanyphone = cleanPhone(phone);
        let user = await User.findOne({
            $or: [{
                    email
                },
                {
                    phone: cleanyphone
                }
            ]
        });
        if (user && !user.password) {
            user.password = password;
            user.name = user.name || name;
            await user.save();
            return res.json({
                success: true,
                message: "تم إضافة كلمة المرور لحسابك",
                token: generateToken(user),
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            });
        }
        if (user) {
            return res.status(400).json({
                message: "هذا الحساب موجود مسبقًا"
            });
        }
        const sessionId = crypto.randomBytes(32).toString("hex");
        tempRegistrations.set(sessionId, {
            name,
            email,
            password,
            phone: cleanyphone,
            createdAt: Date.now()
        });
        res.status(200).json({
            success: true,
            sessionId,
            hasEmail: !!email,
            hasPhone: !!cleanyphone,
            message: "اختر طريقة إرسال كود التحقق"
        });
    } catch (err) {
        res.status(500).json({
            message: "خطأ داخلي في السيرفر",
            error: err.message
        });
    }
};

module.exports.sendVerificationCode = async (req, res) => {
    try {
        const {
            sessionId,
            method
        } = req.body;
        const data = tempRegistrations.get(sessionId);
        if (!data) {
            return res.status(400).json({
                message: "جلسة منتهية"
            });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        data.verificationCode = code;
        data.codeExpiresAt = Date.now() + 5 * 60 * 1000;
        tempRegistrations.set(sessionId, data);
        if (method === "email") await sendEmail({to:data.email,subject:'account activation code', text: `كودك هو: ${code}\nصالح لمدة 5 دقايق`});
        if (method === "whatsapp") await sendWhatsAppCode(data.phone, code);
        res.json({
            success: true,
            message: "تم إرسال الكود"
        });
    } catch (err) {
        return res.status(500).json({
            message: "خطأ في السيرفر",
            Error: err.message
        })
    }
};

module.exports.verifyAndRegister = async (req, res) => {
    try {
        const {
            sessionId,
            code
        } = req.body;
        const data = tempRegistrations.get(sessionId);
        if (!data || Date.now() > data.codeExpiresAt || data.verificationCode !== code) {
            tempRegistrations.delete(sessionId);
            return res.status(400).json({
                message: "الكود خاطئ أو منتهي"
            });
        }
        const user = await User.create({
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            verifiedAt: new Date(),
            Role: 'USER'
        });
        tempRegistrations.delete(sessionId);
        res.status(201).json({
            success: true,
            message: "تم التسجيل بنجاح!",
            token: generateToken(user),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        res.status(500).json({
            message: "خطأ في إنشاء الحساب",
            Error: err.message
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
                message: " هذا الإيميل محظور من قبل المسؤول"
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
};

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
                id: delete_account._id,
                email: delete_account.email,
                name: delete_account.name
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء حذف الحساب",
            Error: err.message
        })
    }
};