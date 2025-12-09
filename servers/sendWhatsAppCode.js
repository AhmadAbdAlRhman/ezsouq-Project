const axios = require('axios');
require('dotenv').config();
const API_KEY = process.env.HYPERSENDER_API_KEY;
const API_Authentication = process.env.HYPERSENDER_Authentication;
const HYPERSENDER_API = `https://app.hypersender.com/api/whatsapp/v1/${API_KEY}/send-text`;
const sendWhatsAppCode = async (phone, code) => {
    try {
        const chatId = `${phone}@c.us`;
        const payload = {
            chatId: chatId,
            text: `كود تفعيل حسابك في \n\n\`${code}\`\n\nصالح لمدة 5 دقايق فقط.\nلا تشاركه مع أحد!`,
            link_preview: false,
            link_preview_high_quality: false
        };
        const response = await axios.post(HYPERSENDER_API, payload, {
            headers: {
                'Authorization': `Bearer ${API_Authentication}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        console.log(`تم إرسال الكود بنجاح إلى ${phone} ✅`);
        return {
            success: true,
            phone: phone,
            messageId: response.data?.msg_id || null
        };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.log(errMsg);
        if (errMsg === "Something went wrong, please try again later.") {
            return {
                success: false,
                phone,
                reason: "الرقم غير مسجّل على واتساب ❌"
            };
        }

        // باقي الأخطاء
        console.error(`فشل إرسال الكود إلى ${phone}:`, errMsg);

        return {
            success: false,
            phone,
            reason: "خطأ غير متوقع",
            error: errMsg
        };
    }
}

module.exports = {sendWhatsAppCode};