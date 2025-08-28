const Products = require('../../models/products');
const Users = require('../../models/users');
const Reportes = require('../../models/Report');
const Feedbacks = require('../../models/feedback');

module.exports.getStatistics = async (_req, res) => {
    try {
        const [ProductsCount, UsersCount, ReportesCount, FeedbacksCount, ProductsStats, RatingsStats] = await Promise.all([
            Products.countDocuments(),
            Users.countDocuments(),
            Reportes.countDocuments(),
            Feedbacks.countDocuments(),
            Products.aggregate([{
                $group: {
                    _id: null,
                    totalLikes: {
                        $sum: {
                            $size: {
                                $ifNull: ['$likes', []]
                            }
                        }
                    },
                    totalViews: {
                        $sum: '$views'
                    }
                }
            }]),
            Users.aggregate([{
                $group: {
                    _id: null,
                    totalRating: {
                        $sum: 1
                    }
                }
            }])
        ]);
        res.status(200).json({
            counts: {
                Products: ProductsCount,
                Users: UsersCount,
                Reports: ReportesCount,
                Feedbacks: FeedbacksCount,
                Likes: ProductsStats[0] ?.totalLikes || 0,
                Views: ProductsStats[0] ?.totalViews || 0,
                Rating: RatingsStats[0] ?.totalRating || 0
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

module.exports.getStatisticsCategorey = async (_req, res) => {
    try {
        const result = await Products.aggregate([
            {
                $group: {
                    _id: {
                        $toLower: "$Category_name"
                    },
                    count: {
                        $sum: 1
                    }
                },
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1
                }
            }
        ])
        res.status(200).json({result});
    } catch (err) {
        res.status(500).json({
            message: "",
            Error: err.message
        })
    }
}