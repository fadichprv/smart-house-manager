const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBroadcast
} = require('../controllers/notificationController');

// GET /api/notifications
router.get('/', authenticate, getMyNotifications);

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', authenticate, deleteNotification);

// POST /api/notifications/broadcast (admin only)
router.post('/broadcast', authenticate, requireAdmin, [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('message').trim().notEmpty().withMessage('Message required'),
  body('type').optional().isIn(['info', 'success', 'warning', 'error']),
  body('target_role').optional().isIn(['all', 'admin', 'premium', 'normal']),
], sendBroadcast);

module.exports = router;
