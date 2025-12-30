const fs = require('fs').promises;
const path = require('path');
const safeUnlink = require('./unlink');

// مسارات المجلدات
const imagesDir = path.join(__dirname, '../uploads/images');
const videosDir = path.join(__dirname, '../uploads/videos');
const optimizedVideosDir = path.join(__dirname, '../uploads/videos/optimized');
const usersDir = path.join(__dirname, '../uploads/users');

/**
 * حذف ملفات المنتج (الصور والفيديوهات)
 * @param {Object} product - كائن المنتج
 */
async function deleteProductFiles(product) {
    try {
        if (!product) return;

        // حذف الصور الأساسية (main_photos)
        // الصور المحسّنة تُحفظ مباشرة في uploads/images/
        if (product.main_photos && Array.isArray(product.main_photos)) {
            for (const photo of product.main_photos) {
                if (photo) {
                    const imagePath = path.join(imagesDir, photo);
                    await safeUnlink(imagePath);
                }
            }
        }

        // حذف الصور الإضافية (photos)
        if (product.photos && Array.isArray(product.photos)) {
            for (const photo of product.photos) {
                if (photo) {
                    const imagePath = path.join(imagesDir, photo);
                    await safeUnlink(imagePath);
                }
            }
        }

        // حذف الفيديو
        if (product.video) {
            // حذف الفيديو المحسّن من optimized (إذا كان موجوداً)
            const optimizedVideoPath = path.join(optimizedVideosDir, product.video);
            await safeUnlink(optimizedVideoPath);
            
            // حذف الفيديو الأصلي من videos
            const videoPath = path.join(videosDir, product.video);
            await safeUnlink(videoPath);
            
            // إذا كان الفيديو محسّناً، قد يكون اسمه مختلفاً (base-optimized.mp4)
            // لكن في الوقت الحالي، الفيديو يُحفظ مباشرة كـ filename
        }

        console.log(`✅ تم حذف ملفات المنتج: ${product._id}`);
    } catch (err) {
        console.error(`❌ خطأ في حذف ملفات المنتج ${product?._id}:`, err.message);
    }
}

/**
 * حذف ملفات المستخدم (الصور)
 * @param {Object} user - كائن المستخدم
 */
async function deleteUserFiles(user) {
    try {
        if (!user) return;

        // حذف صورة المستخدم (avatar)
        if (user.avatar) {
            const avatarPath = path.join(usersDir, user.avatar);
            await safeUnlink(avatarPath);
            console.log(`✅ تم حذف صورة المستخدم: ${user.avatar}`);
        }
    } catch (err) {
        console.error(`❌ خطأ في حذف ملفات المستخدم ${user?._id}:`, err.message);
    }
}

/**
 * حذف ملفات جميع منتجات المستخدم
 * @param {String} userId - معرف المستخدم
 */
async function deleteAllUserProductFiles(userId) {
    try {
        const Products = require('../models/products');
        const products = await Products.find({ Owner_id: userId });
        
        for (const product of products) {
            await deleteProductFiles(product);
        }
        
        console.log(`✅ تم حذف ملفات جميع منتجات المستخدم: ${userId}`);
    } catch (err) {
        console.error(`❌ خطأ في حذف ملفات منتجات المستخدم ${userId}:`, err.message);
    }
}

module.exports = {
    deleteProductFiles,
    deleteUserFiles,
    deleteAllUserProductFiles
};

