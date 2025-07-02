const User = require('../../models/users');

module.exports.GrantingPermissions = async (req, res) => {
    const user_id = req.body.user_id;
    await User.findByIdAndUpdate({
        _id: user_id
    }, {
        Role: 'ADMIN'
    },
    { new: true }
    ).then((user) => {
        if (!user)
            return res.status(404).json({
                message: 'لا يوجد هذا المستخدم ب قاعدة البيانات'
            });
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.resetToken;
        delete userObj.resetTokenExpire;
        return res.status(200).json({
            message: ' لهذا المستخدم Admin تمت إضافة صلاحية ال ',
            user: userObj
        })
    }).catch((err) => {
        return res.status(500).json({
            message: 'حدث خطأ عند منح الصلاحيات'
        }, {
            Error: err.message
        });
    })
}