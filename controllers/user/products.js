const Gategory = require('../../models/Category');
const Products = require('../../models/products');
const User = require('../../models/users');
const mongoose = require('mongoose');
module.exports.getAllCategories = async (_req, res) => {
    await Gategory.find({}).then((gategory) => {
        if (!gategory)
            return res.status(404).json({
                message: 'لا يوجد أي نوع بالداتا'
            });
        return res.status(200).json(gategory);
    }).catch((err) => {
        res.status(500).json({
            message: err.message
        });
    });
};

module.exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.city)
            filter.city = req.query.city;
        if (req.query.governorates)
            filter.Governorate_name = req.query.governorates;
        if (req.query.Category)
            filter.Category_name = req.query.Category;
        const sortField = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        const pipeline = [{
                $match: filter
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
                $project: {
                    comments: 0,
                    "Owner.password": 0,
                    "Owner.email": 0,
                    "Owner.favorites": 0,
                    "Owner.ratings": 0
                }
            },
            {
                $sort: {
                    [sortField]: order
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ];
        const products = await Products.aggregate(pipeline);
        const total = await Products.countDocuments(filter);
        return res.status(200).json({
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            items: products
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء جلب المنتجات",
            error: err.message
        });
    }
}

module.exports.addProduct = async (req, res) => {
    try {
        const Owner_id = req.query.owner_id;

        // تحقق من وجود Owner ID
        if (!Owner_id) {
            return res.status(400).json({
                message: "يجب تمرير معرف المالك (owner_id)"
            });
        }

        const {
            name,
            Category_name,
            Governorate_name,
            city,
            description,
            price,
            color,
            isnew,
            shape,
            real_estate_type,
            for_sale,
            is_Furniture,
            processor,
            storage
        } = req.body;

        if (!name || !Category_name || !Governorate_name || !city || !price) {
            return res.status(400).json({
                message: "الرجاء تعبئة جميع الحقول الأساسية."
            });
        }
        const mainPhotos = req.files ?. ['main_photos'] ?.map(file => file.filename) || [];
        const optionalPhotos = req.files ?. ['photos'] ?.map(file => file.filename) || [];
        const video = req.files ?. ['video'] ?. [0] ?.filename || null;
        if (mainPhotos.length !== 3) {
            return res.status(400).json({
                message: 'يجب رفع 3 صور أساسية تماماً.',
                current_count: mainPhotos.length
            });
        }
        // تحقق من عدد الصور الإضافية
        if (optionalPhotos.length > 2) {
            return res.status(400).json({
                message: 'لا يمكنك رفع أكثر من صورتين.',
                current_count: mainPhotos.length
            });
        }
        // تأكد من تحويل القيم المنطقية
        const new_product = await Products.create({
            Owner_id,
            name,
            Category_name,
            Governorate_name,
            city,
            main_photos: mainPhotos,
            description,
            price,
            video,
            photos: optionalPhotos,
            color,
            isnew: isnew === 'true' || isnew === true,
            for_sale: for_sale === 'true' || for_sale === true,
            is_Furniture: is_Furniture === 'true' || is_Furniture === true,
            shape,
            real_estate_type,
            processor,
            storage
        });

        res.status(201).json({
            message: "تمت إضافة العرض بنجاح",
            product: new_product
        });

    } catch (err) {
        console.error("خطأ أثناء إضافة المنتج:", err); // مفيد لتتبع الخطأ في اللوغ
        res.status(500).json({
            message: "حدث خطأ أثناء إضافة المنتج",
            error: err.message
        });
    }
}
module.exports.getOneProduct = async (req, res) => {
    const pro_id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pro_id))
        return res.status(400).json({
            message: "معرّف غير صالح"
        });
    await Products.findById(
            pro_id
        )
        .populate('Owner_id', 'name avatar phone averageRating')
        .then((pro) => {
            if (!pro)
                return res.status(404).json({
                    message: "لا يوجد مثل هذا المنتج"
                });
            return res.status(200).json(pro);
        }).catch((err) => {
            res.status(500)
                .json({
                    message: "Error Server",
                    Error: err.details
                });
        })
}
module.exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        const filter = keyword ? {
            $or: [{
                    name: {
                        $regex: keyword,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: keyword,
                        $options: 'i'
                    }
                }
            ]
        } : {};

        const [products, total] = await Promise.all([
            Products.find(filter)
            .populate('Owner_id', 'name avatar phone')
            .skip(skip)
            .limit(limit)
            .exec(),
            Products.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            data: products,
            currentPage: page,
            totalPages,
            totalItems: total,
        });
    } catch (err) {
        console.error('Error during product search:', err);
        return res.status(500).json({
            message: 'حدث خطأ أثناء البحث عن المنتجات',
            error: err.message,
        });
    }
}

module.exports.toggleFavorite = async (req, res) => {
    try {
        const user_id = req.user.id;
        const product_id = req.body.product_id;

        if (!user_id || !product_id) {
            return res.status(400).json({
                message: 'الرجاء تمرير معرف المستخدم ومعرف المنتج'
            });
        }

        // جلب المستخدم
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({
                message: 'المستخدم غير موجود'
            });
        }

        const isFavorite = user.favorites.includes(product_id);

        if (isFavorite) {
            // إزالة المنتج من المفضلة
            user.favorites.pull(product_id);
        } else {
            // إضافة المنتج إلى المفضلة
            user.favorites.addToSet(product_id); // addToSet يمنع التكرار
        }

        await user.save();

        return res.status(200).json({
            message: isFavorite ? 'تمت إزالة المنتج من المفضلة' : 'تمت إضافة المنتج إلى المفضلة',
            favorite: !isFavorite,
            productId: product_id
        });

    } catch (err) {
        return res.status(500).json({
            message: 'حدث خطأ أثناء تعديل المفضلة',
            error: err.message
        });
    }
}

module.exports.getAllSaved = async (req, res) => { 
    try {
        const user_id = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortField = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'asc' ? 1 : -1;
        const user = await User.findById(user_id).select('favorites');
        if (!user) {
            return res.status(404).json({
                message: "المستخدم غير موجود"
            });
        }
        const favoritesIds = user.favorites.map(id => new mongoose.Types.ObjectId(id));
        const favorites = await Products.aggregate([{
                $match: {
                    _id: {
                        $in: favoritesIds
                    }
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
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "favorites",
                    as: "likedBy"
                }
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likedBy"
                    }
                }
            },
            {
                $project: {
                    name: 1,
                    main_photos: 1,
                    price: 1,
                    Category_name: 1,
                    Governorate_name: 1,
                    city: 1,
                    createdAt: 1,
                    "Owner.name": 1,
                    "Owner.username": 1,
                    commentsCount: 1,
                    likesCount: 1,
                    views: 1
                }
            },
            {
                $sort: {
                    [sortField]: order
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
            currentPage: page,
            totalPages: Math.ceil(favoritesIds.length / limit),
            totalItems: favoritesIds.length,
            items: favorites
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء جلب العناصر المفضلة",
            Error: err.message
        })
    }
}

module.exports.toggleLike = async (req, res) => {
    try {
        const user_id = req.user.id;
        const product_id = req.body.product_id;
        if (!user_id || !product_id)
            return res.status(400).json({
                message: 'يرجى تمرير معرف المستخدم والمنتج'
            });
        const product = await Products.findById(product_id);
        if (!product)
            return res.status(404).json({
                message: 'المنتج غير موجود'
            });
        const alreadyLiked = product.likes.includes(user_id);
        if (alreadyLiked)
            product.likes.pull(user_id);
        else
            product.likes.addToSet(user_id);
        product.Category_name = product.Category_name;
        await product.save();
        res.status(200).json({
            message: alreadyLiked ? 'تم إلغاء الإعجاب' : 'تم تسجيل الإعجاب',
            liked: !alreadyLiked,
            totalLikes: product.likes.length
        });
    } catch (err) {
        res.status(500).json({
            message: 'حدث خطأ أثناء تعديل الإعجاب',
            error: err.message
        });
    }
}

module.exports.getAllLikes = async (req, res) => {
    const productId = req.query.productId;
    const userId = req.query.user_id;
    try {
        const product = await Products.findById(productId).populate('likes', 'name');
        if (!product)
            return res.status(404).json({
                message: "المنتج غير موجود حالياً."
            });
        const likesCount = product.likes.length;
        const likers = product.likes.map(user => user.name);
        const currentUserIsLike = userId ?
            product.likes.some(user => user._id.toString() === userId.toString()) :
            false;
        return res.status(200).json({
            count: likesCount,
            users: likers,
            current_user_is_like: currentUserIsLike
        });

    } catch (err) {
        return res.status(500).json({
            message: "حدث خطأ أثناء جلب الإعجابات.",
            Error: err.message
        });
    }
}

module.exports.setViews = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user.id;

        const product = await Products.findById(productId)
        if (!product) {
            return res.status(400).json({
                message: "المنتج غير موجود"
            });
        }
        if (!product.viewedBy.includes(userId)) {
            product.views += 1;
            product.viewedBy.push(userId);
            await product.save();
        }
        res.status(200).json({
            message: "تم زيادة عدد المشاهدة بنجاح",
            views: product.views
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء زيادة عدد المشاهدة",
            Error: err.message
        })
    }
}

module.exports.deleteProduct = async (req, res) => {
    try {
        const product_id = req.params.productId;
        const product = await Products.findByIdAndDelete(product_id);
        if (!product) {
            res.status(404).json({
                message: "لم يتم العثور على المنتج"
            });
        }
        res.status(200).json({
            message: "تم حذف المنتج بنجاح"
        })
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء حذف المنتج",
            Error: err.message
        })
    }
}