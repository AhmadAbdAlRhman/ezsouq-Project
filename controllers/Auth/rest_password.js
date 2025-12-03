const crypto = require("crypto");
const User = require("../../models/users");
const { sendEmail } = require("../../servers/sendEmailCode");
//This is for send Code to Email for mobile
module.exports.requestResetCode = async (req, res) => {
    const email = req.body.email;
    await User.findOne({
        email
    }).then(async (user) => {
        if (!user)
            return res.status(404).json({
                message: "الإيميل غير موجود ب قاعدة البيانات"
            });
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        user.resetToken = code;
        user.resetTokenExpire = Date.now() + 1000 * 60 * 10;
        await user.save();
        sendEmail({
            to: user.email,
            subject: "كود لتهائية كلمة المرور",
            text: `الكود هو : ${code}`
        });
        res.status(200).json({
            message: "تم إرسال الكود للإيميل"
        });
    })
};
//This is for check Code that entered from mobile
module.exports.checkCode = async (req, res) => {
    const code = req.body.code;
    await User.findOne({
        resetToken: code,
        resetTokenExpire: {
            $gt: Date.now()
        }
    }).then(async (user) => {
        if (!user)
            return res.status(400).json({
                message: "الكود غير صحيح/ تأخرت في إدخال الكود"
            });
        res.status(200).json({
            message: "الكود صحيح"
        });
    }).catch((err) => {
        res.status(400).json({
            message: `خطأ في إدخال الكود => ${err.message}`
        });
    })
}
//This is for change password from mobile
module.exports.changePassword = async (req, res) => {
    const code = req.body.code;
    const newPassword = req.body.newpassword;
    await User.findOne({
        resetToken: code
    }).then(async (user) => {
        if (!user)
            return res.status(404).json({
                message: "المستخدم غير موجود"
            });
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();
        res.status(200).json({
            message: "تم تغير كلمة المرور بنجاح"
        });
    }).catch((err) => {
        res.status(400).json(err.message);
    })
}
//THis is to send email with token to user for website
module.exports.sendResetLink = async (req, res) => {
    const email = req.body.email;
    await User.findOne({
        email
    }).then(async (user) => {
        if (!user)
            return res.status(404).json({
                message: "المستخدم غير موجود"
            });
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 1000 * 60 * 10;
        await user.save();
        const resetLink = `https://ezsouq.store/reset-password/${token}`;
        sendEmail({
            to: email,
            subject: "إعادة تهيأة كلمة المرور",
            text: ` ${resetLink}هذا الإيميل صالح لمدة 10 دقائق فقط`
        });
        res.status(200).json({
            message: "تم إرسال الرابط عن طريق الإيميل"
        });
    }).catch((err) => {
        res.status(500).json({
            message: `${err.message}`
        });
    });
}
//This is for change password from website
module.exports.changePasswordLink = async (req, res) => {
    const token = req.query.token;
    const newPassword = req.body.newPassword;
    await User.findOne({
        resetToken: token,
        resetTokenExpire: {
            $gt: Date.now()
        }
    }).then(async (user)=>{
        if(!user)
            return res.status(404).json({message:"المستخدم غير موجود"});
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();
        return res.status(200).json({message:"تم تغير كلمة المرور بنجاح وأمان"});
    }).catch((err) => {
        console.log(err.message);
        return res.status(500).json({message: `${err.message}`});
    });
}