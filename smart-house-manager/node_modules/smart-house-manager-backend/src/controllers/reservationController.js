const { query, getClient } = require('../config/database');
const { validationResult } = require('express-validator');

// Business rules
const RULES = {
  normal: {
    maxPerDay: 1,
    maxPerWeek: 3,
    maxDurationMinutes: 240, // 4 hours
    advanceBookingDays: 3,
  },
  premium: {
    maxPerDay: 3,
    maxPerWeek: 10,
    maxDurationMinutes: 480, // 8 hours
    advanceBookingDays: 14,
  },
  admin: {
    maxPerDay: 999,
    maxPerWeek: 999,
    maxDurationMinutes: 1440,
    advanceBookingDays: 365,
  },
};

const checkConflict = async (roomId, startTime, endTime, excludeId = null) => {
  let sql = `
    SELECT id FROM reservations
    WHERE room_id = $1
      AND status IN ('confirmed', 'pending')
      AND NOT (end_time <= $2 OR start_time >= $3)
  `;
  const params = [roomId, startTime, endTime];

  if (excludeId) {
    sql += ` AND id != $4`;
    params.push(excludeId);
  }

  const result = await query(sql, params);
  return result.rows.length > 0;
};

const getUserDailyCount = async (userId, date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const result = await query(
    `SELECT COUNT(*) FROM reservations
     WHERE user_id = $1 AND status IN ('confirmed','pending')
       AND start_time >= $2 AND start_time <= $3`,
    [userId, dayStart.toISOString(), dayEnd.toISOString()]
  );
  return parseInt(result.rows[0].count);
};

const getUserWeeklyCount = async (userId, date) => {
  const d = new Date(date);
  const day = d.getDay();
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - day);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const result = await query(
    `SELECT COUNT(*) FROM reservations
     WHERE user_id = $1 AND status IN ('confirmed','pending')
       AND start_time >= $2 AND start_time <= $3`,
    [userId, weekStart.toISOString(), weekEnd.toISOString()]
  );
  return parseInt(result.rows[0].count);
};

const createReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { room_id, start_time, end_time, notes } = req.body;
    const user = req.user;
    const rules = RULES[user.role];

    const start = new Date(start_time);
    const end = new Date(end_time);
    const now = new Date();

    // Validate times
    if (start < now) {
      return res.status(400).json({ error: 'Cannot book in the past.' });
    }

    const durationMinutes = (end - start) / (1000 * 60);
    if (durationMinutes <= 0) {
      return res.status(400).json({ error: 'End time must be after start time.' });
    }

    // Check room-specific max duration
    const roomResult = await query('SELECT * FROM rooms WHERE id = $1 AND is_available = true', [room_id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found or unavailable.' });
    }
    const room = roomResult.rows[0];

    const roomMaxDuration = user.role === 'normal' ? room.max_duration_normal : room.max_duration_premium;
    const effectiveMax = Math.min(rules.maxDurationMinutes, roomMaxDuration);

    if (durationMinutes > effectiveMax) {
      return res.status(400).json({
        error: `Maximum booking duration is ${effectiveMax} minutes (${Math.floor(effectiveMax / 60)}h ${effectiveMax % 60}m) for your account type.`
      });
    }

    // Check advance booking limit
    const advanceDays = (start - now) / (1000 * 60 * 60 * 24);
    if (advanceDays > rules.advanceBookingDays) {
      return res.status(400).json({
        error: `You can only book up to ${rules.advanceBookingDays} days in advance.`
      });
    }

    // Check daily limit
    const dailyCount = await getUserDailyCount(user.id, start);
    if (dailyCount >= rules.maxPerDay) {
      return res.status(400).json({
        error: `You have reached your daily reservation limit (${rules.maxPerDay} per day).`
      });
    }

    // Check weekly limit
    const weeklyCount = await getUserWeeklyCount(user.id, start);
    if (weeklyCount >= rules.maxPerWeek) {
      return res.status(400).json({
        error: `You have reached your weekly reservation limit (${rules.maxPerWeek} per week).`
      });
    }

    // Check for conflicts
    const hasConflict = await checkConflict(room_id, start.toISOString(), end.toISOString());
    if (hasConflict) {
      return res.status(409).json({ error: 'This time slot is already booked.' });
    }

    // Create reservation
    const result = await query(
      `INSERT INTO reservations (user_id, room_id, start_time, end_time, status, notes)
       VALUES ($1, $2, $3, $4, 'confirmed', $5)
       RETURNING *`,
      [user.id, room_id, start.toISOString(), end.toISOString(), notes || null]
    );

    const reservation = result.rows[0];

    // Create notification
    await query(
      `INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
       VALUES ($1, $2, $3, 'reservation', $4, 'reservation')`,
      [
        user.id,
        'Reservation Confirmed',
        `Your reservation for ${room.name} on ${start.toLocaleDateString()} has been confirmed.`,
        reservation.id
      ]
    );

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').emit('reservation:created', {
        reservation,
        room_name: room.name,
        user_name: user.name
      });
    }

    res.status(201).json({ message: 'Reservation created.', reservation });
  } catch (error) {
    console.error('CreateReservation error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getMyReservations = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const userId = req.user.id;

    let sql = `
      SELECT res.*, r.name as room_name, r.room_type, r.image_url as room_image
      FROM reservations res
      JOIN rooms r ON res.room_id = r.id
      WHERE res.user_id = $1
    `;
    const params = [userId];
    let paramIdx = 2;

    if (status) {
      sql += ` AND res.status = $${paramIdx++}`;
      params.push(status);
    }
    if (upcoming === 'true') {
      sql += ` AND res.end_time > NOW()`;
    }

    sql += ' ORDER BY res.start_time DESC';

    const result = await query(sql, params);
    res.json({ reservations: result.rows });
  } catch (error) {
    console.error('GetMyReservations error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getAllReservations = async (req, res) => {
  try {
    const { status, room_id, user_id, date } = req.query;

    let sql = `
      SELECT res.*, r.name as room_name, r.room_type,
             u.name as user_name, u.email as user_email, u.role as user_role
      FROM reservations res
      JOIN rooms r ON res.room_id = r.id
      JOIN users u ON res.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (status) {
      sql += ` AND res.status = $${paramIdx++}`;
      params.push(status);
    }
    if (room_id) {
      sql += ` AND res.room_id = $${paramIdx++}`;
      params.push(room_id);
    }
    if (user_id) {
      sql += ` AND res.user_id = $${paramIdx++}`;
      params.push(user_id);
    }
    if (date) {
      const d = new Date(date);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      sql += ` AND res.start_time >= $${paramIdx++} AND res.start_time <= $${paramIdx++}`;
      params.push(dayStart.toISOString(), dayEnd.toISOString());
    }

    sql += ' ORDER BY res.start_time DESC LIMIT 200';

    const result = await query(sql, params);
    res.json({ reservations: result.rows });
  } catch (error) {
    console.error('GetAllReservations error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await query(
      `SELECT res.*, r.name as room_name, r.room_type, r.image_url as room_image,
              u.name as user_name, u.email as user_email
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       JOIN users u ON res.user_id = u.id
       WHERE res.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const reservation = result.rows[0];

    // Non-admin can only see their own
    if (user.role !== 'admin' && reservation.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ reservation });
  } catch (error) {
    console.error('GetReservationById error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const result = await query(
      `SELECT res.*, r.name as room_name FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       WHERE res.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const reservation = result.rows[0];

    if (user.role !== 'admin' && reservation.user_id !== user.id) {
      return res.status(403).json({ error: 'You can only cancel your own reservations.' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reservation is already cancelled.' });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed reservation.' });
    }

    await query(
      `UPDATE reservations SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    // Notify user
    await query(
      `INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
       VALUES ($1, $2, $3, 'warning', $4, 'reservation')`,
      [
        reservation.user_id,
        'Reservation Cancelled',
        `Your reservation for ${reservation.room_name} has been cancelled.`,
        id
      ]
    );

    if (req.app.get('io')) {
      req.app.get('io').to(`user:${reservation.user_id}`).emit('reservation:cancelled', { id });
    }

    res.json({ message: 'Reservation cancelled.' });
  } catch (error) {
    console.error('CancelReservation error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateReservation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { start_time, end_time, notes } = req.body;
    const user = req.user;

    const existing = await query(
      `SELECT res.*, r.name as room_name, r.max_duration_normal, r.max_duration_premium
       FROM reservations res JOIN rooms r ON res.room_id = r.id
       WHERE res.id = $1`,
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    const reservation = existing.rows[0];

    if (user.role !== 'admin' && reservation.user_id !== user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (reservation.status !== 'confirmed' && reservation.status !== 'pending') {
      return res.status(400).json({ error: 'Can only update active reservations.' });
    }

    const start = new Date(start_time || reservation.start_time);
    const end = new Date(end_time || reservation.end_time);
    const rules = RULES[user.role];

    const durationMinutes = (end - start) / (1000 * 60);
    const roomMaxDuration = user.role === 'normal' ? reservation.max_duration_normal : reservation.max_duration_premium;
    const effectiveMax = Math.min(rules.maxDurationMinutes, roomMaxDuration);

    if (durationMinutes > effectiveMax) {
      return res.status(400).json({ error: `Maximum duration is ${effectiveMax} minutes.` });
    }

    const hasConflict = await checkConflict(reservation.room_id, start.toISOString(), end.toISOString(), id);
    if (hasConflict) {
      return res.status(409).json({ error: 'Time slot conflict.' });
    }

    const result = await query(
      `UPDATE reservations SET start_time = $1, end_time = $2, notes = COALESCE($3, notes)
       WHERE id = $4 RETURNING *`,
      [start.toISOString(), end.toISOString(), notes, id]
    );

    res.json({ message: 'Reservation updated.', reservation: result.rows[0] });
  } catch (error) {
    console.error('UpdateReservation error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getCalendarReservations = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? parseInt(month) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const result = await query(
      `SELECT res.id, res.start_time, res.end_time, res.status,
              r.name as room_name, r.room_type,
              u.name as user_name
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       JOIN users u ON res.user_id = u.id
       WHERE res.start_time >= $1 AND res.start_time <= $2
         AND res.status IN ('confirmed', 'pending')
       ORDER BY res.start_time`,
      [startDate.toISOString(), endDate.toISOString()]
    );

    res.json({ reservations: result.rows });
  } catch (error) {
    console.error('GetCalendarReservations error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  getReservationById,
  cancelReservation,
  updateReservation,
  getCalendarReservations
};
