const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No valid Bearer token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains { id: user._id }
    next();
  } catch (err) {
    console.error(`[AUTH MIDDLEWARE] 401: Verification failed for ${req.url}: ${err.message}`);
    return res.status(401).json({ error: 'Token is invalid or expired.', details: err.message });
  }
};
