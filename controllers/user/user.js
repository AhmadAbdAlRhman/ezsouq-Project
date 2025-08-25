const User = require('../../models/users');
const Product = require('../../models/products');
const mongoose = require('mongoose');

module.exports.getInfoUser = async (req, res) => {
    const user_id = req.params.user_id;
    if (!mongoose.Types.ObjectId.isValid(user_id))
        return res.status(400).json({
            message: "معرّف غير صالح"
        });
    await User.findById(user_id).select('_id name email Role Location workplace work_type whats_app phone averageRating').then((user) => {
        if (!user)
            return res.status(404).json({
                message: "لا يوجد مثل هذا المستخدم"
            });
        return res.status(200).json(user);
    }).catch((err) => {
        res.status(500)
            .json({
                message: "Error Server",
                Error: err.details
            });
    });
}

module.exports.updateInformationUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = {
            name: req.body.name,
            avatar: req.body.avatar,
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
    const userId = req.user.id;
    const publishId = req.body.user_id;
    const ratingValue = parseInt(req.body.rating);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5)
        return res.status(400).json({
            message: "التقييم يجب أن يكون بين 1 و 5"
        });
    if (publishId === userId)
        return res.status(400).json({
            message: "لا يمكنك تقييم نفسك"
        });
    await User.findById(publishId).then(async (publish) => {
        if (!publish)
            return res.status(404).json({
                message: "الناشر غير موجود"
            });
        publish.ratings.push({
            user_id: userId,
            rating: ratingValue
        });
        const total = publish.ratings.reduce((acc, r) => acc + r.rating, 0);
        publish.averageRating = total / publish.ratings.length;
        await publish.save();
        res.status(200).json({
            message: "تم تقييم الناشر.",
            averageRating: publish.averageRating
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'خطأ بالسيرفر',
            error: err.message
        });
    })

}

module.exports.getProdUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        if (!mongoose.Types.ObjectId.isValid(user_id))
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        const [userExists, products] = await Promise.all([
            User.findById(user_id),
            Product.find({
                Owner_id: user_id
            })
            .populate('Owner_id', 'name email Location workplace work_type whats_app averageRating')
        ]);
        if (!userExists) {
            return res.status(404).json({
                message: "المستخدم غير موجود"
            });
        }
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "حدث خطأ في السيرفر"
        });
    }
}

module.exports.addPhoto = async(req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ message: "الرجاء رفع صورة" });
        }

        const photoUrl = `/uploads/users/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: photoUrl },
            { new: true }
        );

        res.status(200).json({
            message: "تم تحديث صورة البروفايل بنجاح ✅",
            user
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "خطأ أثناء رفع الصورة", Error:error.message });
    }
}