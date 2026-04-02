const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const multer = require('multer');
const path = require('path');
const signatureStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/ssn_cards'), // stored safely alongside
    filename: (req, file, cb) => cb(null, `signature-${Date.now()}${path.extname(file.originalname)}`)
});
const uploadSignature = multer({ storage: signatureStorage });

router.use(authenticate, requireRole('parent'));

router.post('/create', uploadSignature.single('signature_image'), requestController.createRequest);
router.get('/my-requests', requestController.getMyRequests);
router.get('/:request_id', requestController.getRequestById);

module.exports = router;
