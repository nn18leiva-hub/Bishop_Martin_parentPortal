const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', authController.registerParent);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

const { uploadAvatar } = require('../middleware/uploadMiddleware');

router.post('/request-profile-code', authenticate, authController.requestProfileCode);
router.post('/change-profile-password', authenticate, authController.changeProfilePassword);
router.post('/upload-avatar', authenticate, uploadAvatar.single('avatar'), authController.uploadAvatar);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
