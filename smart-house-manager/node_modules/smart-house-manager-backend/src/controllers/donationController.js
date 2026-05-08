const { query } = require('../config/database');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const createDonation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, message, is_anonymous, payment_method } = req.body;
    const userId = req.user.id;
    const transactionId = uuidv4();

    const result = await query(
      `INSERT INTO donations (user_id, amount, message, is_anonymous, payment_method, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, amount, message || null, is_anonymous || false, payment_method || 'card', transactionId]
    );

    const donation = result.rows[0];

    // Notify user
    await query(
      `INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
       VALUES ($1, $2, $3, 'success', $4, 'donation')`,
      [
        userId,
        'Donation Received',
        `Thank you for your donation of $${parseFloat(amount).toFixed(2)}! Your contribution helps maintain our shared home.`,
        donation.id
      ]
    );

    // Broadcast to all users
    if (req.app.get('io')) {
      req.app.get('io').emit('donation:new', {
        amount,
        user_name: is_anonymous ? 'Anonymous' : req.user.name,
        message
      });
    }

    res.status(201).json({ message: 'Donation recorded. Thank you!', donation });
  } catch (error) {
    console.error('CreateDonation error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getMyDonations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT * FROM donations WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const totalResult = await query(
      `SELECT SUM(amount) as total FROM donations WHERE user_id = $1`,
      [userId]
    );

    res.json({
      donations: result.rows,
      total: parseFloat(totalResult.rows[0].total) || 0
    });
  } catch (error) {
    console.error('GetMyDonations error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAllDonations = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await query(
      `SELECT d.*, 
              CASE WHEN d.is_anonymous THEN 'Anonymous' ELSE u.name END as donor_name,
              CASE WHEN d.is_anonymous THEN NULL ELSE u.avatar_url END as donor_avatar
       FROM donations d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC
       LIMIT $1`,
      [parseInt(limit)]
    );

    const statsResult = await query(
      `SELECT 
         SUM(amount) as total_amount,
         COUNT(*) as total_count,
         AVG(amount) as avg_amount,
         MAX(amount) as max_amount
       FROM donations`
    );

    res.json({
      donations: result.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('GetAllDonations error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT 
         u.id,
         u.name,
         u.avatar_url,
         u.role,
         SUM(d.amount) as total_donated,
         COUNT(d.id) as donation_count
       FROM users u
       JOIN donations d ON u.id = d.user_id
       WHERE d.is_anonymous = false
       GROUP BY u.id, u.name, u.avatar_url, u.role
       ORDER BY total_donated DESC
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.json({ leaderboard: result.rows });
  } catch (error) {
    console.error('GetLeaderboard error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getDonationGoal = async (req, res) => {
  try {
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

    const result = await query(
      `SELECT SUM(amount) as monthly_total, COUNT(*) as monthly_count
       FROM donations
       WHERE created_at >= $1 AND created_at <= $2`,
      [monthStart.toISOString(), monthEnd.toISOString()]
    );

    const allTimeResult = await query(
      `SELECT SUM(amount) as all_time_total FROM donations`
    );

    const MONTHLY_GOAL = 500; // $500 monthly goal

    res.json({
      monthly_total: parseFloat(result.rows[0].monthly_total) || 0,
      monthly_count: parseInt(result.rows[0].monthly_count) || 0,
      monthly_goal: MONTHLY_GOAL,
      progress_percent: Math.min(100, ((parseFloat(result.rows[0].monthly_total) || 0) / MONTHLY_GOAL) * 100),
      all_time_total: parseFloat(allTimeResult.rows[0].all_time_total) || 0
    });
  } catch (error) {
    console.error('GetDonationGoal error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { createDonation, getMyDonations, getAllDonations, getLeaderboard, getDonationGoal };
