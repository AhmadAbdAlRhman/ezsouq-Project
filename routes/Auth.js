const express = require('express');
const router = express.Router();
const OAuth = require("../controllers/Auth/OAuth");

router.get('/auth/google', OAuth.login);
router.get('/auth/google/callback', OAuth.callback);
router.get('/profile', OAuth.getProfile);

module.exports = router;