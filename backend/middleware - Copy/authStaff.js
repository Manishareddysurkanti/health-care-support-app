const jwt = require('jsonwebtoken');

function authStaff(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Staff authentication required' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'staff') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.staff = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

module.exports = authStaff;
