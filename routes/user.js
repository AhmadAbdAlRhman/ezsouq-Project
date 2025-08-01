const express = require('express');
const router = express.Router();
const governorates = require('../controllers/user/Governorates');
const products = require('../controllers/user/products');
const user = require('../controllers/user/user');
const feedback = require('../controllers/user/Feedback');
const report = require('../controllers/user/Reported');
const upload = require('../middleware/upload_files');
const protect = require('../middleware/OAtuh');
const checkRole = require('../middleware/checkRole');

router.get('/governorates', governorates.getAllgovernorates);
router.get('/cities/:name', governorates.getAllCities);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/categories', products.getAllCategories);
router.get('/fliteredProducts', products.getFilteredProducts);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/product/:id', products.getOneProduct);
router.get('/search_product', products.search);
router.get('/get_all_likes', products.getAllLikes)
router.get('/get_all_wishes',protect, products.getAllwishes)
router.post('/favorite/toggle', protect, products.toggleFavorite);
router.post('/likedProduct', protect, products.toggleLike);
router.put('/set_count_views:/productId', products.setViews);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.post('/report', protect, report.reportProducts);
router.get('/get_one_report/:reporteId', protect, report.get_one_reporte);
router.put('/update_report/:reporteId', protect, report.update_reporte);
router.delete('/delete_report/:reporteId', protect, report.delete_reporte);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.post('/comment', protect, feedback.comment);
router.get('/all_comments/:product_id', feedback.getAllCommentForProduct);
router.delete('/delete_comment/:comment_id', protect, feedback.deleteComment);
router.put('/update_comment/:comment_id', protect, feedback.updateComments);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/get_user/:user_id', user.getOneUser);
router.put('/update_information', protect, user.updateInformationUser);
router.post('/rating_publisher', protect, user.ratingPublisher);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.post('/add_product',
    protect,
    upload.fields([{
            name: 'main_photos',
            maxCount: 3
        },
        {
            name: 'photos',
            maxCount: 2
        },
        {
            name: 'video',
            maxCount: 1
        }
    ]),
    products.addProduct);
module.exports = router;