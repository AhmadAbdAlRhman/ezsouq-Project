# استخدام Socket.io للإشعارات - دليل العميل

## الاتصال بالـ Socket Server

```javascript
import { io } from 'socket.io-client';

// الاتصال بالخادم
const socket = io('http://localhost:3010', {
    auth: {
        token: 'YOUR_JWT_TOKEN' // التوكن من تسجيل الدخول
    },
    transports: ['websocket', 'polling']
});

// عند الاتصال بنجاح
socket.on('connect', () => {
    console.log('✅ تم الاتصال بالخادم');
});

// عند استقبال إشعار جديد
socket.on('new-notification', (notification) => {
    console.log('📬 إشعار جديد:', notification);
    // عرض الإشعار للمستخدم
    showNotification(notification);
});

// عند الاتصال (رسالة ترحيب)
socket.on('connected', (data) => {
    console.log('رسالة ترحيب:', data);
});

// عند انقطاع الاتصال
socket.on('disconnect', () => {
    console.log('❌ تم انقطاع الاتصال');
});

// عند حدوث خطأ
socket.on('connect_error', (error) => {
    console.error('خطأ في الاتصال:', error.message);
});
```

## مثال React

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function NotificationComponent() {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // الحصول على التوكن من localStorage أو context
        const token = localStorage.getItem('token');
        
        // الاتصال بالخادم
        const newSocket = io('http://localhost:3010', {
            auth: {
                token: token
            }
        });

        newSocket.on('connect', () => {
            console.log('✅ متصل');
        });

        newSocket.on('new-notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            // عرض إشعار للمستخدم
            showToastNotification(notification);
        });

        setSocket(newSocket);

        // تنظيف عند إلغاء التثبيت
        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <div>
            <h2>الإشعارات</h2>
            {notifications.map(notif => (
                <div key={notif._id}>
                    <p>{notif.message}</p>
                </div>
            ))}
        </div>
    );
}
```

## مثال React Native

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function NotificationScreen() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = AsyncStorage.getItem('token');
        
        const newSocket = io('http://YOUR_SERVER_IP:3010', {
            auth: { token },
            transports: ['websocket']
        });

        newSocket.on('new-notification', (notification) => {
            // عرض إشعار محلي
            PushNotification.localNotification({
                title: 'إشعار جديد',
                message: notification.message,
                data: notification
            });
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return null;
}
```

## الأحداث المتاحة

### الأحداث الواردة (من الخادم):
- `connected`: عند الاتصال بنجاح
- `new-notification`: عند استقبال إشعار جديد
- `disconnect`: عند انقطاع الاتصال

### الأحداث الصادرة (إلى الخادم):
- `join-room`: للانضمام إلى غرفة معينة
- `leave-room`: لمغادرة غرفة معينة

## ملاحظات مهمة

1. **التوكن**: يجب إرسال JWT token في `auth.token` عند الاتصال
2. **إعادة الاتصال**: Socket.io يعيد الاتصال تلقائياً عند انقطاعه
3. **التحقق**: الخادم يتحقق من صحة التوكن قبل قبول الاتصال

