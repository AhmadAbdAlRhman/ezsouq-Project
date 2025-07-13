const User = require('../../models/users');
const mongoose = require('mongoose');

module.exports.getOneUser = async (req, res) => {
    const user_id = req.params.user_id;
    if (!mongoose.Types.ObjectId.isValid(user_id))
        return res.status(400).json({
            message: "معرّف غير صالح"
        });
    await User.findById(user_id).select('_id name email Role Location workplace work_type whats_app').then((user) => {
        if (!user)
            return res.status(404).json({message:"لا يوجد مثل هذا المستخدم"});
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
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
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

