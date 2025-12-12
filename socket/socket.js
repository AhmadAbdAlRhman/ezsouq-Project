const jwt = require('jsonwebtoken');
const BlacklistToken = require('../models/BlacklistToken');
const User = require('../models/users');
require('dotenv').config();

// خريطة لتخزين اتصالات المستخدمين: userId -> socketId[]
const userSockets = new Map();

// مصادقة Socket connection
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization ?.split(' ')[1];

        if (!token) {
            return next(new Error('التوكن غير موجود'));
        }

        // التحقق من Blacklist
        const isTokenBlacklisted = await BlacklistToken.findOne({
            token
        });
        if (isTokenBlacklisted) {
            return next(new Error('التوكن محظور'));
        }

        // التحقق من التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error('المستخدم غير موجود'));
        }

        if (user.Role === 'BANNED') {
            return next(new Error('تم حظرك من النظام'));
        }

        if (user.tokenVersion !== decoded.tokenVersion) {
            return next(new Error('انتهت الجلسة'));
        }

        // إضافة معلومات المستخدم إلى socket
        socket.userId = decoded.id.toString();
        socket.user = user;

        next();
    } catch (err) {
        next(new Error(`خطأ في المصادقة: ${err.message}`));
    }
};

// إعداد Socket.io
const setupSocket = (io) => {
    // تطبيق middleware للمصادقة
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        const userId = socket.userId;

        console.log(`✅ مستخدم متصل: ${userId} (Socket ID: ${socket.id})`);

        // إضافة socket للمستخدم
        if (!userSockets.has(userId)) {
            userSockets.set(userId, []);
        }
        userSockets.get(userId).push(socket.id);

        // إرسال رسالة ترحيب
        socket.emit('connected', {
            message: 'تم الاتصال بنجاح',
            userId: userId
        });

        // عند انقطاع الاتصال
        socket.on('disconnect', () => {
            console.log(`❌ مستخدم منقطع: ${userId} (Socket ID: ${socket.id})`);

            // إزالة socket من الخريطة
            const sockets = userSockets.get(userId);
            if (sockets) {
                const index = sockets.indexOf(socket.id);
                if (index > -1) {
                    sockets.splice(index, 1);
                }
                // إذا لم يعد هناك sockets للمستخدم، احذف المدخل
                if (sockets.length === 0) {
                    userSockets.delete(userId);
                }
            }
        });

        // للاستماع إلى الأحداث الأخرى إذا لزم الأمر
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(`المستخدم ${userId} انضم إلى الغرفة ${roomId}`);
        });

        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            console.log(`المستخدم ${userId} غادر الغرفة ${roomId}`);
        });
    });

    return io;
};

// دالة لإرسال إشعار لمستخدم محدد
const sendNotificationToUser = (io, userId, notification) => {
    const sockets = userSockets.get(userId);

    if (sockets && sockets.length > 0) {
        sockets.forEach(socketId => {
            io.to(socketId).emit('new-notification', notification);
        });
        console.log(`📬 تم إرسال إشعار للمستخدم ${userId}`);
        return true;
    } else {
        console.log(`⚠️ المستخدم ${userId} غير متصل`);
        return false;
    }
};

// دالة لإرسال إشعار لجميع المستخدمين في غرفة معينة
const sendNotificationToRoom = (io, roomId, notification) => {
    io.to(roomId).emit('new-notification', notification);
};

module.exports = {
    setupSocket,
    sendNotificationToUser,
    sendNotificationToRoom,
    userSockets
};