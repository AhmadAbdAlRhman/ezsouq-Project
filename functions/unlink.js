const fs = require('fs').promises;

async function safeUnlink(filePath) {
    try {
        await fs.unlink(filePath);
        console.log("✅ تم حذف الملف:", filePath);
    } catch (err) {
        if (err.code !== 'ENOENT') { // تجاهل إذا الملف مش موجود
            console.error("❌ فشل حذف الملف:", err.message);
        }
    }
}

module.exports = safeUnlink;
