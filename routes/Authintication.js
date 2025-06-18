const express = require('express');
const router = express.Router();
const OAuth = require("../controllers/Auth/OAuth");
const Auth = require("../controllers/Auth/Auth");

router.get('/auth/google', OAuth.login);
router.get('/auth/google/callback', OAuth.callback);
router.get('/profile', OAuth.getProfile);

router.post('/register', Auth.register);
router.post('/login', Auth.login);

module.exports = router;