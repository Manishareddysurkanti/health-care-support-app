const express = require('express');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

const router = express.Router();

function signStaffToken(staff) {
  return jwt.sign(
    { role: 'staff', email: staff.email, name: staff.name, id: staff._id },
    process.env.JWT_SECRET || 'carebridge-dev-secret',
    { expiresIn: '8h' }
  );
}

function maskEmail(email) {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  const visible = user.length <= 2 ? user[0] : user.slice(0, 2);
  return `${visible}***@${domain}`;
}

router.get('/setup-status', async (req, res) => {
  try {
    const staff = await Staff.findOne({ attributes: ['email'] });
    res.json({
      needsSetup: !staff,
      registeredEmail: staff ? maskEmail(staff.email) : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const staff = await Staff.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!staff) {
      return res.status(404).json({ error: 'No staff account found with this email' });
    }

    staff.password = password;
    await staff.save();

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const existing = await Staff.count();
    if (existing > 0) {
      return res.status(403).json({ error: 'Staff account already exists. Please sign in.' });
    }

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const staff = await Staff.create({ name, email, password });

    const token = signStaffToken(staff);

    res.status(201).json({
      token,
      staff: { name: staff.name, email: staff.email },
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'This email is already registered' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create staff account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const staff = await Staff.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!staff) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await staff.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signStaffToken(staff);

    res.json({
      token,
      staff: { name: staff.name, email: staff.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
