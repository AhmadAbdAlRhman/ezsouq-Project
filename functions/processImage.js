const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const ffmpeg = require("fluent-ffmpeg");
const sanitize = require("sanitize-filename");
const safeUnlink = require('./unlink');

const optimizedDirImage = path.join(__dirname, "../uploads/images");
const optimizedDirVideo = path.join(__dirname, "../uploads/videos/optimized");

if (!fs.existsSync(optimizedDirImage)) fs.mkdirSync(optimizedDirImage, {
    recursive: true
});
if (!fs.existsSync(optimizedDirVideo)) fs.mkdirSync(optimizedDirVideo, {
    recursive: true
});

async function processImage(filePath) {
    try {
        const ext = path.extname(filePath);
        const base = path.basename(filePath, ext);
        const outputFilename = `${base}-optimized.webp`;
        const outputPath = path.join(optimizedDirImage, outputFilename);

        await sharp(filePath)
            .resize({
                width: 1000
            })
            .webp({
                quality: 80
            })
            .toFile(outputPath);
        await safeUnlink(filePath);
        return outputFilename;
    } catch (err) {
        console.error("❌ خطأ في معالجة الصورة:", err);
        throw err;
    }
}


async function processVideo(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const ext = path.extname(filePath);
            const base = sanitize(path.basename(filePath, ext));
            const outputFilename = `${base}-optimized.mp4`;
            const outputPath = path.join(optimizedDirVideo, outputFilename);

            ffmpeg(filePath)
                .outputOptions([
                    "-vf scale=1280:-1", // تقليل الدقة
                    "-crf 28",
                    "-preset fast"
                ])
                .on("start", command => console.log("FFmpeg command:", command))
                .on("error", err => {
                    console.error("❌ خطأ في ffmpeg:", err);
                    reject(err);
                })
                .on("end", () => {
                    fs.unlink(filePath, err => {
                        if (err) console.error("❌ فشل حذف الملف الأصلي:", err);
                    });
                    resolve(outputFilename);
                })
                .save(outputPath);
        } catch (err) {
            console.error("❌ خطأ غير متوقع في processVideo:", err);
            reject(err);
        }
    });
}
module.exports = {
    processImage,
    processVideo
};