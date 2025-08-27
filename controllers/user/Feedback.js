const Feedback = require('../../models/feedback');
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
    const newFeedback = new Feedback({
        comments,
        user_id,
        product_id,
        parent_comment: parent_comment || null
    });
    await newFeedback.save().then(() => {
        res.status(201).json(newFeedback);
    }).catch((err) => {
        res.status(500).json({
            message: 'حدث خطأ أثناء إضافة التعليق',
            Error: err.message
        });
    });
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
    await Feedback.findByIdAndDelete(id).then((deleted) => {
        if (!deleted)
            return res.status(404).json({
                message: 'لم يتم العثور على التعليق'
            });
        res.status(200).json({
            message: 'تم حذف التعليق بنجاح'
        });
    }).catch((err) => {
        res.status(500).json({
            message: 'حدث خطأ أثناء حذف التعليق',
            err
        });
    });
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
                    select: '_id name email'
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