const User = require('../../models/users');
const Products = require('../../models/products');
const mongoose =require('mongoose');
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
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const roleQuery = req.query.role || 'both';
        let roleFilter = {};
        if (roleQuery === 'USER') {
            roleFilter = {
                Role: 'USER'
            };
        } else if (roleQuery === 'ADMIN') {
            roleFilter = {
                Role: 'ADMIN'
            };
        } else {
            roleFilter = {
                Role: {
                    $in: ['USER', 'ADMIN']
                }
            };
        }
        const filter = roleFilter;
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
    } catch (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({
            message: 'فشل في جلب المستخدمين',
            error: err.message
        });
    }

}
module.exports.getUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;
        const filter = {
            Role: 'USER'
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
    } catch (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({
            message: 'فشل في جلب المستخدمين',
            error: err.message
        });
    }

}

module.exports.getTopUser = async (_req, res) => {
    try {
        const topUsers = await Products.aggregate([{
                $group: {
                    _id: "$Owner_id",
                    totalProducts: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    totalProducts: -1
                }
            },
            {
                $limit: 2
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    userName: "$user.name",
                    avatar: "$user.avatar",
                    email: "$user.eamil",
                    phone: "$user.phone",
                    totalProducts: 1
                }
            }
        ]);
        res.status(200).json({
            topUsers
        });
    } catch (err) {
        res.status(500).json({
            message: "مستخدمين TOP حدث خطأ أثناء جلب ",
            Error: err.message
        })
    }
}

module.exports.toggleBanUser = async (req, res) => {
    try {
        const user_id = req.body.userId;
        const action = req.body.action;
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({
                message: "معرّف غير صالح"
            });
        }
        let banStatus ;
        if(action === 'ban')
            banStatus = true;
        else if(action === 'unban'){
            banStatus = false;
        }else{
            return res.status(400).json({
                message: "الرجاء إرسال action صحيح (ban أو unban)"
            });
        }
        const user = await User.findByIdAndUpdate(user_id, {
            isBanned: banStatus
        }, {
            new: true
        });
        if (!user) {
            return res.status(404).json({
                message: "لا يوجد مثل هذا المستخدم"
            });
        }
        const msg = banStatus
            ? "تم حظر المستخدم بنجاح"
            : "تم إلغاء حظر المستخدم بنجاح";
        return res.status(200).json({
            message: msg
        })
    } catch (err) {
        return res.status(500).json({
            message: "حدث خطأ أثناء تحديث حالة الحظر",
            Error: err.message
        })
    }
}