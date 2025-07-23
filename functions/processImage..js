const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage(filePath, outputDir) {
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const outputFilename = `${base}-optimized.webp`;
    const outputPath = path.join(outputDir, outputFilename);

    await sharp(filePath)
        .resize({ width: 1000 })
        .webp({ quality: 80 })
        .toFile(outputPath);

    fs.unlinkSync(filePath); 

    return outputFilename;
}
