const { query } = require('../config/database');

class Notification {
  static async findByUser(userId, limit = 50) {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async create(data) {
    const { user_id, title, message, type, related_id, related_type } = data;
    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, related_id, related_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, title, message, type || 'info', related_id || null, related_type || null]
    );
    return result.rows[0];
  }

  static async markRead(id, userId) {
    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async markAllRead(userId) {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
  }

  static async getUnreadCount(userId) {
    const result = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }
}

module.exports = Notification;
