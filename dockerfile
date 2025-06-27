# استخدم صورة Node الرسمية
FROM node:22

# إعداد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات المشروع
COPY package*.json ./

# تثبيت الحزم
RUN npm install

# نسخ باقي الملفات
COPY . .

# تحديد البورت
EXPOSE 3010

# أمر التشغيل
CMD ["npx", "nodemon", "server.js"]

