const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authenticate, requireRole('parent'));

router.post('/create', requestController.createRequest);
router.get('/my-requests', requestController.getMyRequests);
router.get('/:request_id', requestController.getRequestById);

module.exports = router;
