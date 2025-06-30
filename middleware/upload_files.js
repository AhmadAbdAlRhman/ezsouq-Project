const multer = require("multer");
const storage = require("../functions/storage");
const fileFilter = require("../validation/fileFilter");


const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 200 * 1024 * 1024
    }
});

module.exports = upload;