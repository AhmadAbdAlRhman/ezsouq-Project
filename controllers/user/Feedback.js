const Feedback = require('../../models/feedback');
const Notification = require('../../models/Notification');
const Products = require('../../models/products');
const User = require('../../models/users');
const { sendNotificationToUser } = require('../../socket/socket');
const mongoose = require('mongoose');

module.exports.comment = async (req, res) => {
    const user_id = req.user.id;
    const product_id = req.body.product_id;
    const comments = req.body.comment;
    const parent_comment = req.body.parent_comment;
    if (!comments || !product_id)
        return res.status(404).json({
            message: 'الرجاء تعبئة جميع الحقول المطلوبة'
        });
    
    try {
        // الحصول على Socket.io من app
        const io = req.app.get('io');
        
        const newFeedback = new Feedback({
            comments,
            user_id,
            product_id,
            parent_comment: parent_comment || null
        });
        await newFeedback.save();

        // الحصول على معلومات المنتج والمستخدم
        const product = await Products.findById(product_id).populate('Owner_id', 'name avatar');
        const commenter = await User.findById(user_id, 'name avatar');

        // إنشاء إشعار لصاحب المنتج (فقط إذا لم يكن هو من علق)
        if (product && product.Owner_id && product.Owner_id._id.toString() !== user_id) {
            const notificationMessage = parent_comment 
                ? `قام ${commenter.name} بالرد على تعليقك في منشور "${product.name}"`
                : `قام ${commenter.name} بالتعليق على منشورك "${product.name}"`;

            const notification = await Notification.create({
                user_id: product.Owner_id._id,
                type: parent_comment ? 'reply' : 'comment',
                message: notificationMessage,
                product_id: product_id,
                comment_id: newFeedback._id,
                from_user_id: user_id,
                isRead: false
            });

            // إرسال الإشعار عبر Socket
            if (io) {
                const notificationData = await Notification.findById(notification._id)
                    .populate('from_user_id', 'name avatar')
                    .populate('product_id', 'name main_photos')
                    .populate('comment_id', 'comments');
                
                sendNotificationToUser(io, product.Owner_id._id.toString(), notificationData);
            }
        }

        // إذا كان التعليق رد على تعليق آخر، أرسل إشعار لصاحب التعليق الأصلي
        if (parent_comment) {
            const parentComment = await Feedback.findById(parent_comment).populate('user_id', 'name avatar');
            if (parentComment && parentComment.user_id && parentComment.user_id._id.toString() !== user_id) {
                const notificationMessage = `قام ${commenter.name} بالرد على تعليقك في منشور "${product.name}"`;
                
                const notification = await Notification.create({
                    user_id: parentComment.user_id._id,
                    type: 'reply',
                    message: notificationMessage,
                    product_id: product_id,
                    comment_id: newFeedback._id,
                    from_user_id: user_id,
                    isRead: false
                });

                // إرسال الإشعار عبر Socket
                if (io) {
                    const notificationData = await Notification.findById(notification._id)
                        .populate('from_user_id', 'name avatar')
                        .populate('product_id', 'name main_photos')
                        .populate('comment_id', 'comments');
                    
                    sendNotificationToUser(io, parentComment.user_id._id.toString(), notificationData);
                }
            }
        }

        res.status(201).json(newFeedback);
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء إضافة التعليق',
            Error: err.message
        });
    }
}

module.exports.getAllCommentForProduct = async (req, res) => {
    try {
        const product_id = req.params.product_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const productObjectId = new mongoose.Types.ObjectId(product_id);
        const total = await Feedback.countDocuments({
            product_id: productObjectId,
            parent_comment: null
        });
        const feedbacks = await Feedback.aggregate([{
                $match: {
                    product_id: productObjectId,
                    parent_comment: null
                }
            },
            {
                $lookup: {
                    from: "feedbacks",
                    let: {
                        commentId: "$_id"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $eq: ["$parent_comment", "$$commentId"]
                            }
                        },
                    }, {
                        $count: "count"
                    }],
                    as: "repliesCount"
                }
            },
            {
                $addFields: {
                    repliesCount: {
                        $ifNull: [{
                            $arrayElemAt: ["$repliesCount.count", 0]
                        }, 0]
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            }, {
                $unwind: "$user"
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);
        res.status(200).json({
            total,
            page,
            pages: Math.ceil(total / limit),
            count: feedbacks.length,
            feedbacks,
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء جلب التعليقات',
            Error: err.message
        });
    };
}

module.exports.deleteComment = async (req, res) => {
    const id = req.params.comment_id;
    const user_id = req.user.id;
    try{
        const deleted = await Feedback.findOneAndDelete(
        {
            _id: id,
            user_id: user_id
        })
    if (!deleted)
        return res.status(404).json({
            message: 'لم يتم العثور على التعليق'
        });
    res.status(200).json({
        message: 'تم حذف التعليق بنجاح'
    });
    }catch(err){
        res.status(500).json({
            message: 'حدث خطأ أثناء حذف التعليق',
            err
        });
    }
}

module.exports.updateComments = async (req, res) => {
    const id = req.params.comment_id;
    const comments = req.body.comments;
    if (!comments || comments.trim() === '')
        return res.status(400).json({
            message: 'يرجى إدخال تعليق صالح'
        });
    await Feedback.findByIdAndUpdate(
        id, {
            comments
        }, {
            new: true
        }
    ).then((updated) => {
        if (!updated)
            return res.status(404).json({
                message: 'لم يتم العثور على التعليق'
            });
        res.status(200).json({
            message: 'تم تحديث التعليق بنجاح',
            updated
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'حدث خطأ أثناء تحديث التعليق',
            err
        });
    });
}

module.exports.getOneComment = async (req, res) => {
    try {
        const comment_id = req.params.comment_id;
        const Id = new mongoose.Types.ObjectId(comment_id);
        const comment = await Feedback.findById(Id)
            .populate('user_id', 'name email')
            .populate({
                path: 'replies',
                populate: {
                    path: 'user_id',
                    select: '_id name email avatar'
                }
            });

        if (!comment) {
            return res.status(404).json({
                message: 'التعليق غير موجود'
            });
        }

        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ",
            Error: err.message
        })
    }
}