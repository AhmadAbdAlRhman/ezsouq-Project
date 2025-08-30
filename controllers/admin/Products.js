const Category = require('../../models/Category');
const Products = require('../../models/products');

module.exports.addCtegory = async (req, res) => {
    try {
        const name = req.body.name;
        if (!name)
            return res.status(400).json({
                message: "..الاسم مطلوب"
            });
        const existing = await Category.findOne({
            name
        });
        if (existing)
            return res.status(409).json({
                message: "التصنيف موجود مسبقاً"
            });
        const newCategory = new Category({
            name
        });
        await newCategory.save();
        return res.status(201).json({
            message: "تمت إضافة التصنيف بنجاح"
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ في السيرفر",
            error: err.message
        });
    }
}

module.exports.getTopProducts = async (_req, res) => {
    try {
        const topLikedProducts = await Products.aggregate([{
                $project: {
                    name: 1,
                    Owner_id: 1,
                    main_photo: {
                        $arrayElemAt: ["$main_photos", 0]
                    },
                    views: 1,
                    totalLikes: {
                        $size: {
                            $ifNull: ["$likes", []]
                        }
                    }
                }
            },
            {
                $sort: {
                    totalLikes: -1
                }
            },
            {
                $limit: 3
            },
            {
                $lookup: {
                    from: "users",
                    localField: "Owner_id",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $unwind: "$owner"
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    main_photo: 1,
                    views: 1,
                    totalLikes: 1,
                }
            }
        ]);

        res.json({
            topLikedProducts
        });
    } catch (err) {
        res.status(500).json({
            message: "خطأ أثناء جلب المنتجات",
            Error: err.message
        })
    }
}