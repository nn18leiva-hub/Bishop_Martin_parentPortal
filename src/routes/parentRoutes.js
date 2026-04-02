const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { uploadSSN } = require('../middleware/uploadMiddleware');

router.use(authenticate, requireRole('parent'));

router.post('/upload-ssn-card', uploadSSN.single('ssn_image'), parentController.uploadSSNCard);
router.get('/profile', parentController.getProfile);

module.exports = router;
