const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', authController.registerParent);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.post('/request-profile-code', authenticate, authController.requestProfileCode);
router.post('/change-profile-password', authenticate, authController.changeProfilePassword);

module.exports = router;
