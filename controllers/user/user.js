const fs = require("fs").promises;
const path = require("path");
const User = require('../../models/users');
const Product = require('../../models/products');
const Rating = require('../../models/ratingSchema');
const mongoose = require('mongoose');

module.exports.getInfoUser = async (req, res) => {
    const user_id = req.params.user_id;
    if (!mongoose.Types.ObjectId.isValid(user_id))
        return res.status(400).json({
            message: "معرّف غير صالح"
        });
    try {
        const user = await User.findById(user_id).select('_id name email Role Location workplace work_type whats_app phone averageRating avatar');
        if (!user)
            return res.status(404).json({
                message: "لا يوجد مثل هذا المستخدم"
            });
        return res.status(200).json(user);
    } catch (err) {
        res.status(500)
            .json({
                message: "خطأ في الخادم",
                Error: err.details
            });
    };
}

module.exports.updateInformationUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = {
            name: req.body.name,
            phone: req.body.phone,
            Location: req.body.Location,
            workplace: req.body.workplace,
            work_type: req.body.work_type,
            whats_app: req.body.whats_app
        };
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                $set: updates
            }, {
                new: true,
                runValidators: true
            }
        );
        if (!updatedUser) {
            return res.status(404).json({
                message: 'المستخدم غير موجود'
            });
        }
        return res.status(200).json({
            message: 'تم تحديث بيانات المستخدم بنجاح',
            user: updatedUser
        });
    } catch (err) {
        return res.status(500).json({
            message: 'حدث خطأ أثناء تحديث البيانات',
            error: err.message
        });
    }
}

module.exports.ratingPublisher = async (req, res) => {
    try {
        const sender = req.user.id;
        const publishId = req.body.user_id;
        const ratingValue = parseInt(req.body.rating);
        const message = req.body.message;
        if (!ratingValue || ratingValue < 1 || ratingValue > 5)
            return res.status(400).json({
                message: "التقييم يجب أن يكون بين 1 و 5"
            });
        if (publishId === sender)
            return res.status(400).json({
                message: "لا يمكنك تقييم نفسك"
            });
        const publish = await User.findById(publishId);
        if (!publish)
            return res.status(404).json({
                message: "الناشر غير موجود"
            });
        await Rating.create({
            sender: sender,
            publish: publishId,
            rating:ratingValue,
            message
        });
        const ratings = await Rating.find({
            publish: publishId
        });
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        const average = total / ratings.length;
        const pub = await User.findByIdAndUpdate(publishId, {
            averageRating: average
        });
        res.status(200).json({
            message: "تم تقييم الناشر.",
            averageRating: pub.averageRating
        });
    } catch (err) {
        res.status(500).json({
            message: 'خطأ بالسيرفر',
            error: err.message
        });
    }
}

module.exports.getProdUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!mongoose.Types.ObjectId.isValid(user_id))
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        const userExists = await User.findById(user_id);
        if (!userExists) {
            return res.status(404).json({
                message: "المستخدم غير موجود"
            });
        }
        const products = await Product.aggregate([{
                $match: {
                    Owner_id: new mongoose.Types.ObjectId(user_id)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "Owner_id",
                    foreignField: "_id",
                    as: "Owner"
                }
            },
            {
                $unwind: "$Owner"
            },
            {
                $lookup: {
                    from: "feedbacks",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    commentsCount: {
                        $size: "$comments"
                    }
                }
            },
            {
                $addFields: {
                    commentsCount: {
                        $size: "$comments"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    price: 1,
                    unit:1,
                    Category_name: 1,
                    Governorate_name: 1,
                    city: 1,
                    main_photos: 1,
                    views: 1,
                    commentsCount: 1,
                    video: 1,
                    color: 1,
                    isnew: 1,
                    photos: 1,
                    engine_type: 1,
                    shape: 1,
                    real_estate_type: 1,
                    for_sale: 1,
                    in_Furniture: 1,
                    processor: 1,
                    sotarge: 1,
                    likes: 1,
                    views: 1,
                    createdAt: 1,
                    "Owner._id": 1,
                    "Owner.name": 1,
                    "Owner.email": 1,
                    "Owner.Location": 1,
                    "Owner.workplace": 1,
                    "Owner.work_type": 1,
                    "Owner.phone": 1,
                    "Owner.whats_app": 1,
                    "Owner.averageRating": 1,
                    "Owner.avatar": 1
                }
            }
        ]);
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ في السيرفر",
            Error: err.message
        });
    }
}

module.exports.addPhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({
                message: "الرجاء رفع صورة"
            });
        }

        const photoUrl = `${req.protocol}://${req.get("host")}/uploads/users/${req.file.filename}`;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "المستخدم غير موجود"
            });
        }
        if (user.avatar) {
            try {
                const oldFileName = user.avatar.split("/uploads/users/")[1];
                if (oldFileName) {
                    const oldFilePath = path.join(__dirname, "../uploads/users", oldFileName);
                    await fs.unlink(oldFilePath); // حذف الملف بشكل غير متزامن
                }
            } catch (err) {
                console.warn("فشل حذف الصورة القديمة:", err.message);
            }
        }
        user.avatar = photoUrl;
        await user.save();
        res.status(200).json({
            message: "تم تحديث صورة البروفايل بنجاح ✅",
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "خطأ أثناء رفع الصورة",
            Error: error.message
        });
    }
}

module.exports.getOnePhotoByUserId = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        }

        const user = await User.findById(user_id).select("avatar");

        if (!user) {
            return res.status(404).json({
                message: "لا يوجد مثل هذا المستخدم"
            });
        }

        if (!user.avatar) {
            return res.status(404).json({
                message: "لا توجد صورة للمستخدم"
            });
        }

        return res.status(200).json({
            message: "تم جلب الصورة بنجاح ✅",
            avatar: user.avatar
        });

    } catch (err) {
        return res.status(500).json({
            message: "خطأ في الخادم",
            error: err.message
        });
    }
};