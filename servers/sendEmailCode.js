const nodemailer = require('nodemailer');
require('dotenv').config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});
const sendEmail = async ({ to, subject, text }) => {
    try {
        const htmlContent =  `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 12px; max-width: 600px; margin: auto;">
                <h2 style="color: #00d4ff;">SecureChat</h2>
                <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        ${text.replace(/\n/g, '<br>')}
                    </p>
                </div>
                <p style="text-align: center; color: #888; margin-top: 20px; font-size: 12px;">
                    © 2025 SecureChat - جميع الحقوق محفوظة
                </p>
            </div>
        `;
        const info = await transporter.sendMail({
            from: `"SecureChat" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: htmlContent
        });
        console.log(`تم إرسال الإيميل بنجاح إلى ${to} | Message ID: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
            preview: nodemailer.getTestMessageUrl(info) // شغال فقط لو تستخدم Ethereal أو Mailtrap
        };
    } catch (error) {
        console.error(`فشل إرسال الإيميل إلى ${to}:`, error.message);
        throw new Error("فشل إرسال البريد الإلكتروني، تأكد من الإعدادات أو حاول مرة أخرى");
    }
};

module.exports = { sendEmail };