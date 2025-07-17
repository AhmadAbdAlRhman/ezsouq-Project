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

module.exports = fileFilter;