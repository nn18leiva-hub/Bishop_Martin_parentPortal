const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authenticate, requireRole('staff'));

router.get('/requests', staffController.getAllRequests);
router.get('/pending-parents', staffController.getPendingParents);
router.post('/verify-parent', staffController.verifyParent);
router.post('/verify-payment', staffController.verifyPayment);
router.post('/update-request-status', staffController.updateRequestStatus);
router.get('/password-resets', staffController.getPendingPasswordResets);
router.post('/approve-password-reset', staffController.approvePasswordReset);
router.delete('/password-reset/:id', staffController.deletePasswordReset);

module.exports = router;
