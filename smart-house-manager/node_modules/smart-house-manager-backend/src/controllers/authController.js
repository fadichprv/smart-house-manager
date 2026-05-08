const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { query } = require('../config/database');
const { signToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'normal', $4)
       RETURNING id, name, email, role, avatar_url, phone, total_donations, created_at`,
      [name, email, passwordHash, phone || null]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: user.role });

    // Create welcome notification
    await query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, 'info')`,
      [user.id, 'Welcome!', `Welcome to Smart House Manager, ${name}! Start by exploring available rooms.`]
    );

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, name, email, password_hash, role, avatar_url, phone, is_active, total_donations, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful.',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, avatar_url } = req.body;
    const userId = req.user.id;

    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone), avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, name, email, role, avatar_url, phone, total_donations, created_at`,
      [name, phone, avatar_url, userId]
    );

    res.json({ message: 'Profile updated.', user: result.rows[0] });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
