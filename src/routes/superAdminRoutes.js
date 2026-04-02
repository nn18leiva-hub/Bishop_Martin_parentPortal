const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authenticate, requireRole('super_admin'));

router.post('/staff', superAdminController.createStaffUser);
router.get('/staff', superAdminController.getAllStaffUsers);
router.delete('/staff/:staff_id', superAdminController.deleteStaffUser);

module.exports = router;
