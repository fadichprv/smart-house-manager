const { query } = require('../config/database');

class Room {
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filters.room_type) { sql += ` AND room_type = $${idx++}`; params.push(filters.room_type); }
    if (filters.is_available !== undefined) { sql += ` AND is_available = $${idx++}`; params.push(filters.is_available); }

    sql += ' ORDER BY name';
    const result = await query(sql, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await query('SELECT * FROM rooms WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async create(data) {
    const { name, description, capacity, room_type, amenities, image_url, floor, max_duration_normal, max_duration_premium } = data;
    const result = await query(
      `INSERT INTO rooms (name, description, capacity, room_type, amenities, image_url, floor, max_duration_normal, max_duration_premium)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, description, capacity, room_type || 'common', amenities || [], image_url, floor || 1, max_duration_normal || 240, max_duration_premium || 480]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = Object.keys(data).filter(k => data[k] !== undefined);
    if (fields.length === 0) return this.findById(id);

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => data[f]);
    values.push(id);

    const result = await query(
      `UPDATE rooms SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id) {
    await query('DELETE FROM rooms WHERE id = $1', [id]);
  }
}

module.exports = Room;
