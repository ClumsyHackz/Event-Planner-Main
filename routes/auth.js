const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../lib/store');
const { requireAuth } = require('../middleware/auth');
const safeUser = store.userPublic;
const secret = () => process.env.JWT_SECRET || 'local-development-secret-change-before-deploy';
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, studentId } = req.body;
    if (!name || !email || !password || String(password).length < 8) return res.status(400).json({ error: 'Name, email, and a password of at least 8 characters are required' });
    if (store.users.findByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists' });
    const user = store.users.create({ name: String(name).trim(), email: String(email).toLowerCase().trim(), passwordHash: await bcrypt.hash(String(password), 12), studentId: studentId ? String(studentId).trim() : '', role: 'student' });
    res.status(201).json({ token: jwt.sign({ sub: user.id }, secret(), { expiresIn: '7d' }), user: safeUser(user) });
  } catch (e) { next(e); }
});
router.post('/login', async (req, res, next) => {
  try {
    const user = store.users.findByEmail(req.body.email || '');
    if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect' });
    res.json({ token: jwt.sign({ sub: user.id }, secret(), { expiresIn: '7d' }), user: safeUser(user) });
  } catch (e) { next(e); }
});
router.get('/me', requireAuth, (req, res) => res.json({ user: safeUser(req.user) }));
module.exports = router;
