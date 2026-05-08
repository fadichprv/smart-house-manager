const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

const requireAdmin = requireRole('admin');
const requirePremiumOrAdmin = requireRole('admin', 'premium');

const canManageReservation = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  if (user.role === 'admin') {
    return next();
  }

  const { query } = require('../config/database');
  try {
    const result = await query('SELECT user_id FROM reservations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }
    if (result.rows[0].user_id !== user.id) {
      return res.status(403).json({ error: 'You can only manage your own reservations.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { requireRole, requireAdmin, requirePremiumOrAdmin, canManageReservation };
