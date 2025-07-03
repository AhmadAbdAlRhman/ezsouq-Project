const User = require('../../models/users');

module.exports.GrantingPermissions = async (req, res) => {
    const user_id = req.body.user_id;
    await User.findByIdAndUpdate({
        _id: user_id
    }, {
        Role: 'ADMIN'
    }, {
        new: true
    }).then((user) => {
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

module.exports.WithdrawPermissions = async (req, res) => {
    const user_id = req.body.user_id;
    await User.findByIdAndUpdate({
        _id: user_id
    }, {
        Role: 'USER'
    }, {
        new: true
    }).then((user) => {
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

module.exports.DeleteUser = async (req, res) => {
    const user_id = req.body.user_id;
    const owner_id = req.user.id;
    if (owner_id === user_id)
        return res.status(400).json({
            message: "لا يمكنك حذف حسابك الشخصي"
        });
    await User.findByIdAndDelete(user_id).then((deletedUser) => {
        if (!deletedUser)
            return res.status(404).json({
                message: "المستخدم الذي تريد حذفه غير مسجل من قبل"
            });
        return res.status(200).json({
            message: "تم حذف المستخدم الذي تريده"
        });
    }).catch((err) => {
        return res.status(500).json({
            message: "خطأ من السيرفر",
            Err: err.message
        });
    });
}