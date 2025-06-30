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
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

module.exports = storage;