const { query } = require('../config/database');
const { validationResult } = require('express-validator');

const getAllRooms = async (req, res) => {
  try {
    const { type, available, floor } = req.query;

    let sql = `
      SELECT r.*,
        COUNT(DISTINCT res.id) FILTER (WHERE res.status IN ('confirmed','pending') AND res.end_time > NOW()) as active_reservations
      FROM rooms r
      LEFT JOIN reservations res ON r.id = res.room_id
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    if (type) {
      sql += ` AND r.room_type = $${paramIdx++}`;
      params.push(type);
    }
    if (available !== undefined) {
      sql += ` AND r.is_available = $${paramIdx++}`;
      params.push(available === 'true');
    }
    if (floor !== undefined) {
      sql += ` AND r.floor = $${paramIdx++}`;
      params.push(parseInt(floor));
    }

    sql += ' GROUP BY r.id ORDER BY r.name';

    const result = await query(sql, params);
    res.json({ rooms: result.rows });
  } catch (error) {
    console.error('GetAllRooms error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const roomResult = await query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Get upcoming reservations for this room
    const reservationsResult = await query(
      `SELECT res.id, res.start_time, res.end_time, res.status,
              u.name as user_name
       FROM reservations res
       JOIN users u ON res.user_id = u.id
       WHERE res.room_id = $1
         AND res.status IN ('confirmed', 'pending')
         AND res.end_time > NOW()
       ORDER BY res.start_time
       LIMIT 20`,
      [id]
    );

    res.json({
      room: roomResult.rows[0],
      upcoming_reservations: reservationsResult.rows
    });
  } catch (error) {
    console.error('GetRoomById error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, capacity, room_type, amenities, image_url, floor, max_duration_normal, max_duration_premium } = req.body;

    const result = await query(
      `INSERT INTO rooms (name, description, capacity, room_type, amenities, image_url, floor, max_duration_normal, max_duration_premium)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, description, capacity, room_type || 'common', amenities || [], image_url, floor || 1, max_duration_normal || 240, max_duration_premium || 480]
    );

    res.status(201).json({ message: 'Room created.', room: result.rows[0] });
  } catch (error) {
    console.error('CreateRoom error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, capacity, room_type, amenities, image_url, is_available, floor, max_duration_normal, max_duration_premium } = req.body;

    const existing = await query('SELECT id FROM rooms WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const result = await query(
      `UPDATE rooms SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        capacity = COALESCE($3, capacity),
        room_type = COALESCE($4, room_type),
        amenities = COALESCE($5, amenities),
        image_url = COALESCE($6, image_url),
        is_available = COALESCE($7, is_available),
        floor = COALESCE($8, floor),
        max_duration_normal = COALESCE($9, max_duration_normal),
        max_duration_premium = COALESCE($10, max_duration_premium)
       WHERE id = $11
       RETURNING *`,
      [name, description, capacity, room_type, amenities, image_url, is_available, floor, max_duration_normal, max_duration_premium, id]
    );

    res.json({ message: 'Room updated.', room: result.rows[0] });
  } catch (error) {
    console.error('UpdateRoom error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM rooms WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Check for active reservations
    const activeRes = await query(
      `SELECT id FROM reservations WHERE room_id = $1 AND status IN ('confirmed','pending') AND end_time > NOW()`,
      [id]
    );
    if (activeRes.rows.length > 0) {
      return res.status(409).json({ error: 'Cannot delete room with active reservations.' });
    }

    await query('DELETE FROM rooms WHERE id = $1', [id]);
    res.json({ message: 'Room deleted.' });
  } catch (error) {
    console.error('DeleteRoom error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const getRoomAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await query(
      `SELECT res.start_time, res.end_time, u.name as reserved_by
       FROM reservations res
       JOIN users u ON res.user_id = u.id
       WHERE res.room_id = $1
         AND res.status IN ('confirmed', 'pending')
         AND res.start_time >= $2
         AND res.end_time <= $3
       ORDER BY res.start_time`,
      [id, startOfDay.toISOString(), endOfDay.toISOString()]
    );

    res.json({ date: targetDate.toISOString().split('T')[0], reservations: result.rows });
  } catch (error) {
    console.error('GetRoomAvailability error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getRoomAvailability };
