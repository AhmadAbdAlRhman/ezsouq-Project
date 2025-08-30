const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const protect = require('../middleware/OAtuh');
const Governorates = require('../controllers/admin/Governorates');
const products = require('../controllers/admin/Products');
const Users = require('../controllers/admin/users');
const statistics = require('../controllers/admin/statistics');
const report = require('../controllers/user/Reported');
//إضافة محافظة مع المدن التابعة لها
router.post('/add_governorates', protect, checkRole(['ADMIN', 'OWNER']), Governorates.addGovernorates);
//=>تعديل أسماء المحافظة والمدن التابعة لها
router.put('/update_governorate/:gov_id', protect, checkRole(['ADMIN', 'OWNER']), Governorates.updateGovernorate);
//منح صلاحية الأدمن للمستخدم العادي
router.put('/Granting_permissions', protect, checkRole(['OWNER']), Users.GrantingPermissions);
//سحب صلاحية الأدمن
router.put('/Withdraw_permissions', protect, checkRole(['OWNER']), Users.WithdrawPermissions);
//owner حذف المستخدم العادي والأدمن من قبل ال
router.delete('/Delet_User', protect, checkRole(['OWNER']), Users.DeleteUser);
//إضافة التنصيف
router.post('/add_category', protect, checkRole(['ADMIN', 'OWNER']), products.addCtegory);
//عرض التقراير
router.get('/all_reports', protect, checkRole(['ADMIN', 'OWNER']), report.get_all_reportedProducts);
//admin عرض جميع المستخدمين ال عادريين وال
router.get('/get_all_users', protect, checkRole(['OWNER']), Users.getAllUser);
//admin عرض جميع المستخدمين ال عادريين
router.get('/get_users', protect, checkRole(['ADMIN']), Users.getUser);
//عرض الإحصائيات
router.get('/statistics', protect, checkRole(['OWNER', 'ADMIN']), statistics.getStatistics);
// عرض الإحصائيات المنتجات
router.get('/category_statistics', protect, checkRole(['OWNER', 'ADMIN']), statistics.getStatisticsCategorey);
// مستخدمين TOP عرض 
router.get('/top_users', protect, checkRole(['ADMIN', 'OWNER']), Users.getTopUser);
module.exports = router;