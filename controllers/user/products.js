const Gategory = require('../../models/Category');
const Products = require('../../models/products');
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

// mod