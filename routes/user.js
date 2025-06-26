const express = require('express');
const router = express.Router();
const governorates = require('../controllers/user/Governorates');
const products = require('../controllers/user/products');

router.get('/governorates', governorates.getAllgovernorates);
router.get('/cities', governorates.getAllCities);
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
router.get('/categories',products.getAllCategories);
router.get('/sortedProducts',products.getAllSortedProducts);
router.get('/fliteredProducts',products.getFilteredProducts);
module.exports = router;