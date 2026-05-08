const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const {
  getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomAvailability
} = require('../controllers/roomController');

// GET /api/rooms
router.get('/', authenticate, getAllRooms);

// GET /api/rooms/:id
router.get('/:id', authenticate, getRoomById);

// GET /api/rooms/:id/availability
router.get('/:id/availability', authenticate, getRoomAvailability);

// POST /api/rooms (admin only)
router.post('/', authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Room name required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('room_type').optional().isIn(['bedroom', 'bathroom', 'kitchen', 'living_room', 'study', 'gym', 'laundry', 'common']),
], createRoom);

// PUT /api/rooms/:id (admin only)
router.put('/:id', authenticate, requireAdmin, [
  body('name').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 1 }),
  body('room_type').optional().isIn(['bedroom', 'bathroom', 'kitchen', 'living_room', 'study', 'gym', 'laundry', 'common']),
  body('is_available').optional().isBoolean(),
], updateRoom);

// DELETE /api/rooms/:id (admin only)
router.delete('/:id', authenticate, requireAdmin, deleteRoom);

module.exports = router;
