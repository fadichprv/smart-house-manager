const { query } = require('../config/database');

class Reservation {
  static async findById(id) {
    const result = await query(
      `SELECT res.*, r.name as room_name, u.name as user_name
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       JOIN users u ON res.user_id = u.id
       WHERE res.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUser(userId) {
    const result = await query(
      `SELECT res.*, r.name as room_name, r.room_type
       FROM reservations res
       JOIN rooms r ON res.room_id = r.id
       WHERE res.user_id = $1
       ORDER BY res.start_time DESC`,
      [userId]
    );
    return result.rows;
  }

  static async create(data) {
    const { user_id, room_id, start_time, end_time, notes } = data;
    const result = await query(
      `INSERT INTO reservations (user_id, room_id, start_time, end_time, status, notes)
       VALUES ($1, $2, $3, $4, 'confirmed', $5) RETURNING *`,
      [user_id, room_id, start_time, end_time, notes]
    );
    return result.rows[0];
  }

  static async updateStatus(id, status) {
    const result = await query(
      `UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    await query('DELETE FROM reservations WHERE id = $1', [id]);
  }
}

module.exports = Reservation;
