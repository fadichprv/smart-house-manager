const { query } = require('../config/database');

class User {
  static async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, avatar_url, phone, is_active, total_donations, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT id, name, email, role, avatar_url, phone, is_active, total_donations, created_at FROM users WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filters.role) { sql += ` AND role = $${idx++}`; params.push(filters.role); }
    if (filters.is_active !== undefined) { sql += ` AND is_active = $${idx++}`; params.push(filters.is_active); }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  static async create(data) {
    const { name, email, password_hash, role = 'normal', phone } = data;
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, avatar_url, phone, total_donations, created_at`,
      [name, email, password_hash, role, phone]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, phone, avatar_url, role, is_active } = data;
    const result = await query(
      `UPDATE users SET
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         avatar_url = COALESCE($3, avatar_url),
         role = COALESCE($4, role),
         is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING id, name, email, role, avatar_url, phone, is_active, total_donations, created_at`,
      [name, phone, avatar_url, role, is_active, id]
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    await query('DELETE FROM users WHERE id = $1', [id]);
  }
}

module.exports = User;
