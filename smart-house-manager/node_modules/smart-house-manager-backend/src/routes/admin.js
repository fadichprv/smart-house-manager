const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getSystemStats
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', getDashboardStats);

// GET /api/admin/system-stats
router.get('/system-stats', getSystemStats);

// GET /api/admin/users
router.get('/users', getAllUsers);

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', updateUserRole);

// PUT /api/admin/users/:id/toggle-status
router.put('/users/:id/toggle-status', toggleUserStatus);

// DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

module.exports = router;
