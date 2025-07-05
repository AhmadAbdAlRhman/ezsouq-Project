const Gategory = require('../../models/Category');
const Products = require('../../models/products');
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

module.exports.getAllSortedProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const sortField = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;
        const total = await Products.countDocuments();
        await Products.find()
            .populate('Category_id')
            .populate({
                path: 'Owner_id',
                select: '-password' // ✅ هذا السطر يخفي كلمة المرور
            })
            // .populate('Governorates_id')
            .sort({
                [sortField]: order
            })
            .skip(skip)
            .limit(limit)
            .then(async (products) => {
                return res.status(200).json({
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    items: products
                });
            }).catch((err) => {
                return res.status(500).json({
                    message: err.message
                })
            })
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء جلب المنتجات",
            error: err.message
        });
    }
}

module.exports.getFilteredProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.city)
            filter.city = req.query.city;
        if (req.query.governorates)
            filter.Governorates_id = req.query.governorates;
        if (req.query.Category)
            filter.Category_id = req.qeury.Category;
        const total = await Products.countDocuments(filter);
        const sortField = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;
        await Products.find(filter)
            .populate('Category_id')
            .populate('Owner_id')
            .populate('Governorates_id')
            .sort({
                [sortField]: order
            })
            .skip(skip)
            .limit(limit)
            .then(async (products) => {
                return res.status(200).json({
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    items: products
                });
            }).catch((err) => {
                return res.status(500).json({
                    message: err.message
                })
            })
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
        const {
            name,
            Category_id,
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
        const mainPhotos = req.files['main_photos'] ?.map(file => file.filename) || [];
        const optionalPhotos = req.files['photos'] ?.map(file => file.filename) || [];
        const video = req.files['video'] ?. [0] ?.filename || null;
        if (mainPhotos.length !== 3) {
            return res.status(400).json({
                message: 'يجب رفع 3 صور أساسية تماماً.',
                current_count: mainPhotos.length
            });
        }
        const new_product = await Products.create({
            Owner_id,
            name,
            Category_id,
            Governorate_name,
            city,
            main_photos: mainPhotos,
            description,
            price,
            video,
            photos: optionalPhotos,
            color,
            isnew,
            shape,
            real_estate_type,
            for_sale,
            is_Furniture,
            processor,
            storage
        });
        res.status(201).json({
            message: "تمت إضافة العرض بنجاح",
            product: new_product
        });
    } catch (err) {
        res.status(500).json({
            message: "حدث خطأ أثناء إضافة المنتج",
            error: err.message
        })
    }
}

module.exports.getOneProduct = async (req, res) => {
    const pro_id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(pro_id))
        return res.status(400).json({ message: "معرّف غير صالح" });
    await Products.findById(
        pro_id
    ).then((pro) => {
        if (!pro)
            return res.status(404).json({message:"لا يوجد مثل هذا المنتج"});
        return res.status(200).json(pro);
    }).catch((err) => {
        res.status(500)
            .json({
                message: "Error Server",
                Error: err.details
            });
    })
}