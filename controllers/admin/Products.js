const Category = require('../../models/Category');

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