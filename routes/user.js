const express = require('express');
const router = express.Router();
const governorates = require('../controllers/user/Governorates');

router.get('/governorates', governorates.getAllgovernorates);
router.get('/cities', governorates.getAllCities);
module.exports = router