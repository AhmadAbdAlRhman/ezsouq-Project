const express = require('express');
const router = express.Router();
const governorates = require('../controllers/user/Governorates');
const products = require('../controllers/user/products');
const user = require('../controllers/user/user');
const feedback = require('../controllers/user/Feedback');
const upload = require('../middleware/upload_files');
const protect = require('../middleware/OAtuh');

router.get('/governorates', governorates.getAllgovernorates);
router.get('/cities/:name', governorates.getAllCities);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/categories', products.getAllCategories);
router.get('/sortedProducts', products.getAllSortedProducts);
router.get('/fliteredProducts', products.getFilteredProducts);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/product/:id', products.getOneProduct);
router.get('/search_product', products.search);
router.get('/get_all_likes', products.getAllLikes)
router.get('/get_all_wishes',protect, products.getAllwishes)    
router.post('/report', protect, products.reportProducts);
router.post('/favorite/toggle', protect, products.toggleFavorite);
router.post('/likedProduct', protect, products.toggleLike);
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