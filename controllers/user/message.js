const Message = require('../../models/Message');
module.exports.sendMessage = async (req, res) => {
    try {
        const {
            name,
            subject,
            message
        } = req.body;

        if (!name || !subject || !message) {
            return res.status(400).json({
                message: "الاسم، البريد، والرسالة مطلوبة"
            });
        }

        const newMessage = await Message.create({
            name,
            subject,
            message
        });

        res.status(201).json({
            message: "تم إرسال رسالتك بنجاح ✅",
            data: newMessage
        });
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({
            message: "خطأ في الخادم",
            error: error.message
        });
    }
};