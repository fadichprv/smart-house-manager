const { query } = require('../config/database');

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unread_only, limit = 50 } = req.query;

    let sql = `SELECT * FROM notifications WHERE user_id = $1`;
    const params = [userId];
    let paramIdx = 2;

    if (unread_only === 'true') {
      sql += ` AND is_read = false`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIdx}`;
    params.push(parseInt(limit));

    const result = await query(sql, params);

    const unreadCount = await query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadCount.rows[0].count)
    });
  } catch (error) {
    console.error('GetMyNotifications error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `UPDATE notifications SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json({ message: 'Notification marked as read.', notification: result.rows[0] });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('MarkAllAsRead error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(
      `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    console.error('DeleteNotification error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const sendBroadcast = async (req, res) => {
  try {
    const { title, message, type, target_role } = req.body;

    let userQuery = `SELECT id FROM users WHERE is_active = true`;
    const params = [];

    if (target_role && target_role !== 'all') {
      userQuery += ` AND role = $1`;
      params.push(target_role);
    }

    const users = await query(userQuery, params);

    const insertPromises = users.rows.map(user =>
      query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
        [user.id, title, message, type || 'info']
      )
    );

    await Promise.all(insertPromises);

    if (req.app.get('io')) {
      req.app.get('io').emit('notification:broadcast', { title, message, type });
    }

    res.json({ message: `Broadcast sent to ${users.rows.length} users.` });
  } catch (error) {
    console.error('SendBroadcast error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, sendBroadcast };
