const Products = require('../../models/products');
const Users = require('../../models/users');
const Reportes = require('../../models/Report');
const Feedbacks = require('../../models/feedback');
const Governorates = require('../../models/Governorates');
const Categories = require('../../models/Category');

module.exports.getStatistics = async (req, res) => {
    try {
        const [ProductsCount, UsersCount, ReportesCount, FeedbacksCount, GovernoratesCount, CategoriesCount] = await Promise.all([
            Products.countDocuments(),
            Users.countDocuments(),
            Reportes.countDocuments(),
            Feedbacks.countDocuments(),
            Governorates.countDocuments(),
            Categories.countDocuments(),
        ]);
        res.status(200).json({
            counts:{
                "Products":ProductsCount,
                "Users":UsersCount,
                "Reports":ReportesCount,
                "Feedbacks":FeedbacksCount,
                "Governorates": GovernoratesCount,
                "Categories":CategoriesCount
            }
        })
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            message: 'حدث خطأ أثناء جلب الإحصائيات',
            Error: err.message
        })
    }
}