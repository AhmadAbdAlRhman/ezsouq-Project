const Notification = require('../../models/Notification');
const mongoose = require('mongoose');

// الحصول على جميع الإشعارات للمستخدم
module.exports.getNotifications = async (req, res) => {
    try {
        const user_id = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Notification.countDocuments({ user_id });
        
        const notifications = await Notification.find({ user_id })
            .populate('from_user_id', 'name avatar')
            .populate('product_id', 'name main_photos')
            .populate('comment_id', 'comments')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            total,
            page,
            pages: Math.ceil(total / limit),
            count: notifications.length,
            notifications
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء جلب الإشعارات',
            Error: err.message
        });
    }
};

// الحصول على عدد الإشعارات غير المقروءة
module.exports.getUnreadCount = async (req, res) => {
    try {
        const user_id = req.user.id;
        const count = await Notification.countDocuments({
            user_id,
            isRead: false
        });
        res.status(200).json({ unreadCount: count });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء جلب عدد الإشعارات',
            Error: err.message
        });
    }
};

// تحديد الإشعار كمقروء
module.exports.markAsRead = async (req, res) => {
    try {
        const notification_id = req.params.notification_id;
        const user_id = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            {
                _id: notification_id,
                user_id: user_id
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                message: 'الإشعار غير موجود'
            });
        }

        res.status(200).json({
            message: 'تم تحديد الإشعار كمقروء',
            notification
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء تحديث الإشعار',
            Error: err.message
        });
    }
};

// تحديد جميع الإشعارات كمقروءة
module.exports.markAllAsRead = async (req, res) => {
    try {
        const user_id = req.user.id;

        await Notification.updateMany(
            { user_id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            message: 'تم تحديد جميع الإشعارات كمقروءة'
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء تحديث الإشعارات',
            Error: err.message
        });
    }
};

// حذف إشعار
module.exports.deleteNotification = async (req, res) => {
    try {
        const notification_id = req.params.notification_id;
        const user_id = req.user.id;

        const deleted = await Notification.findOneAndDelete({
            _id: notification_id,
            user_id: user_id
        });

        if (!deleted) {
            return res.status(404).json({
                message: 'الإشعار غير موجود'
            });
        }

        res.status(200).json({
            message: 'تم حذف الإشعار بنجاح'
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء حذف الإشعار',
            Error: err.message
        });
    }
};

