const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// All routes require authentication and at least staff role
router.use(authenticate, requireRole('staff'));

// Read-only routes accessible to all staff (admin, viewer, super_admin)
router.get('/staff', superAdminController.getAllStaffUsers);
router.get('/stats', superAdminController.getDetailedStats);
router.get('/users', superAdminController.getAllPublicUsers);

// Write routes - restricted to admin and super_admin (viewers blocked by roleMiddleware)
router.post('/override-password', superAdminController.overridePassword);

// Super admin only - staff creation and deletion
router.post('/staff', requireRole('super_admin'), superAdminController.createStaffUser);
router.delete('/staff/:staff_id', requireRole('super_admin'), superAdminController.deleteStaffUser);

module.exports = router;
