const { query } = require('../config/database');

class Donation {
  static async findByUser(userId) {
    const result = await query(
      'SELECT * FROM donations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async create(data) {
    const { user_id, amount, message, is_anonymous, payment_method, transaction_id } = data;
    const result = await query(
      `INSERT INTO donations (user_id, amount, message, is_anonymous, payment_method, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, amount, message, is_anonymous || false, payment_method || 'card', transaction_id]
    );
    return result.rows[0];
  }

  static async getTotal() {
    const result = await query('SELECT SUM(amount) as total FROM donations');
    return parseFloat(result.rows[0].total) || 0;
  }
}

module.exports = Donation;
