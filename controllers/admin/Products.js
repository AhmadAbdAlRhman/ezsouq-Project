const Category = require('../../models/Category');
const Report = require('../../models/Report');

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

module.exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('product', 'name')
            .populate('reported_by', 'username email')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'فشل في جلب البلاغات', error: error.message });
    }
};