const fs = require('fs');
async function safeUnlink(filePath) {
    try {
        await fs.unlink(filePath);
        console.log("✅ تم حذف الملف:", filePath);
    } catch (err) {
        console.error("❌ فشل حذف الملف:", err);
    }
}

module.exports = safeUnlink;