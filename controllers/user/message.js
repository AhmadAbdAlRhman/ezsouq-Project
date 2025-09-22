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

module.exports.getAllMessage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // رقم الصفحة
        const limit = parseInt(req.query.limit) || 10; // عدد الرسائل بالصفحة
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            Message.find().sort({
                createdAt: -1
            }).skip(skip).limit(limit),
            Message.countDocuments()
        ]);
        if (!messages)
            res.status(404).json({
                message: 'لا يوجد أي رسائل'
            });
        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            messages
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء جلب الرسائل',
            Error: err.message
        })
    }
}

module.exports.get_one_message = async (req, res) => {
    try{
        const message_id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(message_id))
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        const message = await Message.findById(message_id);
        if(!message)
            res.status(404).json({
                message:'لا يوجد هكذا رسالة'
            });
        res.status(200).json(message);
    }catch(err){
        res.status(500).json({
            message:'حدث خطأ أثناء جلب الرسالة',
            Error: err.message
        })
    }
}
module.exports.getUnreadMessages = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({
                isRead: false
            }).sort({
                createdAt: -1
            }).skip(skip).limit(limit),
            Message.countDocuments({
                isRead: false
            })
        ]);

        res.json({
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            messages
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const updated = await Message.findByIdAndUpdate(
            id, {
                isRead: true
            }, {
                new: true
            }
        );
        if (!updated) {
            return res.status(404).json({
                message: "الرسالة غير موجودة"
            });
        }
        res.json(updated);
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء تعديل حالة الرسالة',
            error: err.message
        });
    }
};

module.exports.getUnreadCount = async (_req, res) => {
    try {
        const count = await Message.countDocuments({
            isRead: false
        });
        res.json({
            unreadCount: count
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

module.exports.deleteMessage = async (req, res) => {
    try {
        const message_id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(message_id))
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        const deleted_message = await Message.findByIdAndDelete(message_id);
        if (!deleted_message)
            res.status(404).json({
                message:'لا يوجد مثل هذه الرسالة'
            });
        res.status(200).json({
            message:'تم حذف الرسالة بنجاح'
        })
    }catch(err){
        res.status(500).json({
            message:'حدث خطأ أثناء حذف الرسالة',
            Error: err.message
        })
    }
}