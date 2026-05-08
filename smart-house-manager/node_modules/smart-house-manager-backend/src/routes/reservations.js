const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  cancelReservation,
  updateReservation,
  getCalendarReservations
} = require('../controllers/reservationController');

// GET /api/reservations/my
router.get('/my', authenticate, getMyReservations);

// GET /api/reservations/calendar
router.get('/calendar', authenticate, getCalendarReservations);

// GET /api/reservations (admin: all, user: own)
router.get('/', authenticate, (req, res, next) => {
  if (req.user.role === 'admin') return getAllReservations(req, res, next);
  return getMyReservations(req, res, next);
});

// GET /api/reservations/:id
router.get('/:id', authenticate, getReservationById);

// POST /api/reservations
router.post('/', authenticate, [
  body('room_id').isUUID().withMessage('Valid room ID required'),
  body('start_time').isISO8601().withMessage('Valid start time required'),
  body('end_time').isISO8601().withMessage('Valid end time required'),
  body('notes').optional().isLength({ max: 500 }),
], createReservation);

// PUT /api/reservations/:id
router.put('/:id', authenticate, [
  body('start_time').optional().isISO8601(),
  body('end_time').optional().isISO8601(),
  body('notes').optional().isLength({ max: 500 }),
], updateReservation);

// DELETE /api/reservations/:id (cancel)
router.delete('/:id', authenticate, cancelReservation);

// Admin: get all reservations
router.get('/admin/all', authenticate, requireAdmin, getAllReservations);

module.exports = router;
