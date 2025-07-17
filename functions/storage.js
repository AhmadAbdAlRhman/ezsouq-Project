const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
    destination: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/'))
            cb(null, 'uploads/images');
        else if (file.mimetype.startsWith('video/'))
            cb(null, 'uploads/videos');
        else
            cb(new Error('الملف غير مسموح به'), null);
    },
    filename: (_req, file, cb) => {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const cleanName = file.originalname.replace(/\s+/g, '-');
        cb(null, `${timestamp}-${cleanName}`);
    }
});

module.exports = storage;