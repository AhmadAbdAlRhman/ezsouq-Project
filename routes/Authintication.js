const express = require('express');
const router = express.Router();
const protect = require('../middleware/OAtuh');
const OAuth = require("../controllers/Auth/OAuth");
const Auth = require("../controllers/Auth/Auth");
const reset = require("../controllers/Auth/rest_password");

router.get('/auth/google', OAuth.login);
router.get('/auth/google/callback', OAuth.callback);
router.post('/auth/google/AndroidLogin', OAuth.AndroidLogin);
// router.get('/profile', OAuth.getProfile);

router.post('/register', Auth.register);
router.post('/login', Auth.login);
router.post('/logout', Auth.logout);
router.delete('/delete_account',protect, Auth.delete_account);
router.post("/request-code", reset.requestResetCode);
router.post("/check_code", reset.checkCode);
router.post("/reset_password", reset.changePassword);

router.post("/send_reset_link", reset.sendResetLink);
router.post("/change_password_link", reset.changePasswordLink);

router.post('/start_register', Auth.sendVerificationCode);
router.post('/send_code', Auth.sendVerificationCode);
router.post('/verfied_code&store_information', Auth.verifyAndRegister);
module.exports = router;