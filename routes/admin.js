const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/OAtuh');
const Governorates = require('../controllers/admin/Governorates');
const Users = require('../controllers/admin/users');

router.post('/add_governorates',
    protect,
    checkRole(['ADMIN','OWNER']),
    Governorates.addGovernorates);
//=>update Governorates and cities which belong to it
router.put('/update_governorate/:gov_id',
    protect,
    checkRole(['ADMIN', 'OWNER']),
    Governorates.updateGovernorate
);
router.put('/Granting_permissions', 
    protect,
    checkRole(['OWNER']),
    Users.GrantingPermissions);
router.put('/Withdraw_permissions', 
    protect,
    checkRole(['OWNER']),
    Users.WithdrawPermissions);
module.exports = router;