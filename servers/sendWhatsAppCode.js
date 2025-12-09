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
        console.log(response.data._data.Message.extendedTextMessage.text);
        return {
            ok: true,
            data: response.data
        };
        return response.data;
    } catch (error) {
        const serverMessage = error.response?.data?.message || error.message;
        if (serverMessage.includes("Something went wrong, please try again later.")) {
            console.log("⛔ تحقق من الرقم رجاءً.");
            throw new Error("الرقم غير مسجّل على واتساب ❌");
        }
        if (serverMessage) {
            throw new Error(`خطأ من HyperSender: ${serverMessage}`);
        }
        throw new Error(`فشل إرسال الكود: ${error.message}`);
    }
}

module.exports = {sendWhatsAppCode};