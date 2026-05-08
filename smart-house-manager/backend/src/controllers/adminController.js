const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const getDashboardStats = async (req, res) => {
  try {
    const [usersResult, roomsResult, reservationsResult, donationsResult] = await Promise.all([
      query(`SELECT 
               COUNT(*) as total,
               COUNT(*) FILTER (WHERE role = 'admin') as admins,
               COUNT(*) FILTER (WHERE role = 'premium') as premium,
               COUNT(*) FILTER (WHERE role = 'normal') as normal,
               COUNT(*) FILTER (WHERE is_active = false) as inactive
             FROM users`),
      query(`SELECT 
               COUNT(*) as total,
               COUNT(*) FILTER (WHERE is_available = true) as available,
               COUNT(*) FILTER (WHERE is_available = false) as unavailable
             FROM rooms`),
      query(`SELECT 
               COUNT(*) as total,
               COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
               COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
               COUNT(*) FILTER (WHERE status = 'completed') as completed,
               COUNT(*) FILTER (WHERE end_time > NOW() AND status = 'confirmed') as upcoming
             FROM reservations`),
      query(`SELECT 
               SUM(amount) as total_amount,
               COUNT(*) as total_count,
               SUM(amount) FILTER (WHERE created_at >= date_trunc('month', NOW())) as this_month
             FROM donations`)
    ]);

    // Recent activity
    const recentReservations = await query(
      `SELECT res.id, res.start_time, res.end_time, res.status,
              r.name as room_name, u.name as user_name
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       JOIN users u ON res.user_id = u.id
       ORDER BY res.created_at DESC LIMIT 5`
    );

    // Reservations by day (last 7 days)
    const reservationsByDay = await query(
      `SELECT DATE(start_time) as date, COUNT(*) as count
       FROM reservations
       WHERE start_time >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(start_time)
       ORDER BY date`
    );

    // Most popular rooms
    const popularRooms = await query(
      `SELECT r.name, r.room_type, COUNT(res.id) as reservation_count
       FROM rooms r
       LEFT JOIN reservations res ON r.id = res.room_id
       GROUP BY r.id, r.name, r.room_type
       ORDER BY reservation_count DESC
       LIMIT 5`
    );

    res.json({
      users: usersResult.rows[0],
      rooms: roomsResult.rows[0],
      reservations: reservationsResult.rows[0],
      donations: donationsResult.rows[0],
      recent_reservations: recentReservations.rows,
      reservations_by_day: reservationsByDay.rows,
      popular_rooms: popularRooms.rows
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, is_active, search } = req.query;

    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.phone, u.is_active, u.total_donations, u.created_at,
             COUNT(DISTINCT r.id) as reservation_count
      FROM users u
      LEFT JOIN reservations r ON u.id = r.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (role) {
      sql += ` AND u.role = $${paramIdx++}`;
      params.push(role);
    }
    if (is_active !== undefined) {
      sql += ` AND u.is_active = $${paramIdx++}`;
      params.push(is_active === 'true');
    }
    if (search) {
      sql += ` AND (u.name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await query(sql, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'premium', 'normal'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role.' });
    }

    const result = await query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Notify user of role change
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'info')`,
      [id, 'Account Updated', `Your account role has been updated to ${role}.`]
    );

    res.json({ message: 'User role updated.', user: result.rows[0] });
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account.' });
    }

    const existing = await query('SELECT id, is_active, name FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newStatus = !existing.rows[0].is_active;

    await query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, id]);

    res.json({
      message: `User ${newStatus ? 'activated' : 'deactivated'}.`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('ToggleUserStatus error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    const existing = await query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted.' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    // Monthly reservations trend (last 6 months)
    const monthlyTrend = await query(
      `SELECT 
         TO_CHAR(DATE_TRUNC('month', start_time), 'Mon YYYY') as month,
         COUNT(*) as count,
         COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
         COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
       FROM reservations
       WHERE start_time >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', start_time)
       ORDER BY DATE_TRUNC('month', start_time)`
    );

    // Room utilization
    const roomUtilization = await query(
      `SELECT r.name, r.room_type,
              COUNT(res.id) as total_reservations,
              COALESCE(SUM(EXTRACT(EPOCH FROM (res.end_time - res.start_time))/3600), 0) as total_hours
       FROM rooms r
       LEFT JOIN reservations res ON r.id = res.room_id AND res.status = 'confirmed'
       GROUP BY r.id, r.name, r.room_type
       ORDER BY total_reservations DESC`
    );

    res.json({
      monthly_trend: monthlyTrend.rows,
      room_utilization: roomUtilization.rows
    });
  } catch (error) {
    console.error('GetSystemStats error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { getDashboardStats, getAllUsers, updateUserRole, toggleUserStatus, deleteUser, getSystemStats };
