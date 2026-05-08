const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const {
  createDonation,
  getMyDonations,
  getAllDonations,
  getLeaderboard,
  getDonationGoal
} = require('../controllers/donationController');

// GET /api/donations/my
router.get('/my', authenticate, getMyDonations);

// GET /api/donations/leaderboard
router.get('/leaderboard', authenticate, getLeaderboard);

// GET /api/donations/goal
router.get('/goal', authenticate, getDonationGoal);

// GET /api/donations (admin only)
router.get('/', authenticate, requireAdmin, getAllDonations);

// POST /api/donations
router.post('/', authenticate, [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('message').optional().isLength({ max: 500 }),
  body('is_anonymous').optional().isBoolean(),
  body('payment_method').optional().isIn(['card', 'paypal', 'bank_transfer', 'cash']),
], createDonation);

module.exports = router;
