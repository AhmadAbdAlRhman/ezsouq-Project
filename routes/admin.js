const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/OAtuh');
const Governorates = require('../controllers/admin/Governorates');
const Users = require('../controllers/admin/users');
//إضافة محافظة مع المدن التابعة لها
router.post('/add_governorates',
    protect,
    checkRole(['ADMIN','OWNER']),
    Governorates.addGovernorates);
//=>تعديل أسماء المحافظة والمدن التابعة لها
router.put('/update_governorate/:gov_id',
    protect,
    checkRole(['ADMIN', 'OWNER']),
    Governorates.updateGovernorate
);
//منح صلاحية الأدمن للمستخدم العادي
router.put('/Granting_permissions', 
    protect,
    checkRole(['OWNER']),
    Users.GrantingPermissions);
//سحب صلاحية الأدمن
router.put('/Withdraw_permissions', 
    protect,
    checkRole(['OWNER']),
    Users.WithdrawPermissions);
//owner حذف المستخدم العادي والأدمن من قبل ال  
router.delete('/Delet_User', 
    protect,
    checkRole(['OWNER']),
    Users.DeleteUser);
module.exports = router;