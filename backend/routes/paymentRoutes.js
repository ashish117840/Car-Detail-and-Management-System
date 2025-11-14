const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect, userOrAdmin } = require('../middleware/authMiddleware');

router.post('/create-order', protect, userOrAdmin, createOrder);
router.post('/verify', protect, userOrAdmin, verifyPayment);

module.exports = router;

