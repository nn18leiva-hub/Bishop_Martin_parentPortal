const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { uploadReceipt } = require('../middleware/uploadMiddleware');

router.use(authenticate, requireRole('parent'));

router.get('/instructions', paymentController.getInstructions);
router.post('/upload-receipt', uploadReceipt.single('receipt_image'), paymentController.uploadReceipt);

module.exports = router;
