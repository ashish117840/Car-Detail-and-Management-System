const express = require('express');
const router = express.Router();
const {
  createService,
  getCarServices,
  updateService,
  deleteService,
  getAllServices
} = require('../controllers/serviceController');
const { protect, adminOnly, userOrAdmin } = require('../middleware/authMiddleware');

// ✅ Allow ALL logged-in users to see all services
router.get('/', protect, getAllServices);

// Protected routes
router.post('/', protect, userOrAdmin, createService);
router.get('/:carId', protect, userOrAdmin, getCarServices);
router.put('/:id', protect, userOrAdmin, updateService);
router.delete('/:id', protect, userOrAdmin, deleteService);

module.exports = router;
