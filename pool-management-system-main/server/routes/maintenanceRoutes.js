const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getAllMaintenance,
  getMaintenance,
  updateMaintenance,
  approveMaintenance,
  deleteMaintenance,
  getPoolStatus,
  getUpcomingMaintenance,
  getMaintenanceStats,
  addFutureMaintenance,
  setPoolStatus
} = require('../controllers/maintenanceController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public route
router.get('/pool-status', getPoolStatus);

// Protected routes - require authentication
router.use(protect);

router.put('/pool-status', authorize('admin'), setPoolStatus);

// Maintenance staff and admin routes
router.post('/', authorize('admin', 'staff', 'maintenance'), createMaintenance);
router.get('/', getAllMaintenance);
router.get('/upcoming', getUpcomingMaintenance);
router.get('/stats', authorize('admin'), getMaintenanceStats);
router.get('/:id', getMaintenance);
router.put('/:id', authorize('admin', 'staff', 'maintenance'), updateMaintenance);
router.post('/:id/future-maintenance', authorize('admin', 'staff', 'maintenance'), addFutureMaintenance);

// Admin only routes
router.put('/:id/approve', authorize('admin'), approveMaintenance);
router.delete('/:id', authorize('admin'), deleteMaintenance);

module.exports = router;
