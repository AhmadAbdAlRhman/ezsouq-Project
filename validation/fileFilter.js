const path = require('path');
const fileFilter = (_req, file, cb) => {
    const allowedImagesTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/webp', 'image/heif', 'image/avif', 'image/jpg'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/3gpp'];
    if (allowedImagesTypes.includes(file.mimetype))
        cb(null, true);
    else if (allowedVideoTypes.includes(file.mimetype))
        cb(null, true);
    else
        cb(new Error('❌الملف المرفوع ليس صورة أو فيديو مدعوم'), false);
}

const userFilter = (req, file, cb) => {
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.svg', '.webp', '.heif', '.avif'];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/webp', 'image/heif', 'image/avif', 'image/jpg'];
    const extname = allowedExtensions.includes(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.includes(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("فقط صور بصيغة (jpeg, jpg, png, gif, bmp, svg+xml, webp, heif, avif) مسموح بها"));
    }
};
module.exports = {fileFilter , userFilter};