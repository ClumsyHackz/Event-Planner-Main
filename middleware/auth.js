const jwt = require('jsonwebtoken');
const store = require('../lib/store');
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Sign in required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'local-development-secret-change-before-deploy');
    const user = store.users.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Account not found' });
    req.user = user;
    next();
  } catch (_err) { return res.status(401).json({ error: 'Invalid or expired session' }); }
}
function requireRole(...roles) { return (req, res, next) => req.user && roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have permission to do that' }); }
module.exports = { requireAuth, requireRole };
