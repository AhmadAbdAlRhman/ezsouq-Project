const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/OAtuh');
const Governorates = require('../controllers/admin/Governorates');

router.post('/add_governorates',
    protect,
    checkRole(['ADMIN','OWNER']),
    Governorates.addGovernorates);

module.exports = router;