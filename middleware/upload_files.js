const multer = require("multer");
const {storage, storageuser} = require("../functions/storage");
const {fileFilter, userFilter} = require("../validation/fileFilter");


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024
    }
});
const uploadimage = multer({
    storage: storageuser,
    fileFilter: userFilter,
    limits: {
        fileSize: 200 * 1024 * 1024
    }
});

module.exports = {upload, uploadimage};