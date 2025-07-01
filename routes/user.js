const express = require('express');
const router = express.Router();
const governorates = require('../controllers/user/Governorates');
const products = require('../controllers/user/products');
const upload = require('../middleware/upload_files');
const protect = require('../middleware/OAtuh');

router.get('/governorates', governorates.getAllgovernorates);
router.get('/cities', governorates.getAllCities);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/categories', products.getAllCategories);
router.get('/sortedProducts', products.getAllSortedProducts);
router.get('/fliteredProducts', products.getFilteredProducts);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.post('/add_product',
    protect,
    upload.fields([
        {name: 'main_photos', maxCount: 3},
        {name: 'photos', maxCount: 2},
        {name: 'video', maxCount: 1}
    ]),
    products.addProduct);
module.exports = router;