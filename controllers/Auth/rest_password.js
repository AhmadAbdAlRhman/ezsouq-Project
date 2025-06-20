const crypto = require("crypto");
const User = require("../../models/email_user");
const nodemailer = require("nodemailer");
//This is for send Code to Email for mobile
module.exports.requestResetCode = async (req, res) => {
    const infoContact = req.body.infoContact;
    await User.findOne({
        infoContact
    }).then(async (user) => {
        if (!user)
            return res.status(404).json({
                message: "User not found"
            });
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        user.resetToken = code;
        user.resetTokenExpire = Date.now() + 1000 * 60 * 10;
        await user.save();
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.infoContact,
            subject: "Your Password Reset Code",
            text: `Your reset code is: ${code}`
        });
        res.json({
            message: "Reset code sent to email"
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
                message: "Invalid or expired code"
            });
        res.status(200).json({
            message: "code is true"
        });
    }).catch((err) => {
        res.status(400).json({
            message: `Invalid or expired code => ${err.message}`
        });
    })
}
//This is for change password from mobile
module.exports.changePassword = async (req, res) => {
    const id = req.body.id;
    const newPassword = req.body.newpassword;
    await User.findOne({
        _id: id
    }).then(async (user) => {
        if (!user)
            return res.status(400).json({
                message: "NotFound User"
            });
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();
        res.status(200).json({
            message: "The password is changed safely"
        });
    }).catch((err) => {
        res.status(400).json(err.message);
    })
}
//THis is to send email with token to user for website
module.exports.sendResetLink = async (req, res) => {
    const infoContact = req.body.infoContact;
    await User.findOne({
        infoContact
    }).then(async (user) => {
        if (!user)
            return res.status(404).json({
                message: "The user is not found"
            });
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 1000 * 60 * 10;
        await user.save();
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: infoContact,
            subject: "Password Reset",
            html: `
        <p>Click on the person who has his hand raised to reset your password:</p>
        <a href="${token}">🙋‍♂️🙋‍♂️</a>
        <p>This link is valid for 10 minutes.</p>
        `
        });
        res.json({
            message: "Password reset link sent to your email"
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
            return res.status(404).json({message:"The user not Found"});
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();
        return res.status(200).json({message:"The Password is changed safely"});
    }).catch((err) => {
        console.log(err.message);
        return res.status(500).json({message: `${err.message}`});
    });
}