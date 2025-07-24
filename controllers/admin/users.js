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
            message: ' من هذا المستخدم Admin تمت سحب صلاحية ال ',
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

module.exports.getAllUser = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const roleQuery = req.query.role || 'both';
        let roleFilter = {};
        if (roleQuery === 'USER') {
            roleFilter = { Role: 'USER' };
        } else if (roleQuery === 'ADMIN') {
            roleFilter = { Role: 'ADMIN' };
        } else {
            roleFilter = { Role: { $in: ['USER', 'ADMIN'] } };
        }
        const filter = {
            ...roleFilter,
            Role: { $ne: 'OWNER', ...(roleFilter.Role ? { $eq: roleFilter.Role } : {}) }
        };
        const [users, total] = await Promise.all([
            User.find(filter).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            data: users,
            currentPage: page,
            totalPages,
            totalItems: total,
        });
    }catch(err){
        console.error('Error getting users:', err);
        return res.status(500).json({ message: 'فشل في جلب المستخدمين', error: err.message });
    }

}
module.exports.getUser = async (req, res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const filter = { Role: 'USER' };
        const [users, total] = await Promise.all([
            User.find(filter).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            data: users,
            currentPage: page,
            totalPages,
            totalItems: total,
        });
    }catch(err){
        console.error('Error getting users:', err);
        return res.status(500).json({ message: 'فشل في جلب المستخدمين', error: err.message });
    }

}