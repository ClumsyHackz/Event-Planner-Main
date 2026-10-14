const router = require('express').Router();
const crypto = require('crypto');
const store = require('../lib/store');
const { requireAuth, requireRole } = require('../middleware/auth');
router.get('/', (req, res) => {
  let events = store.events.all().filter(e => e.status === 'approved');
  if (req.query.category && req.query.category !== 'All') events = events.filter(e => e.category === req.query.category);
  if (req.query.q) { const q = String(req.query.q).toLowerCase(); events = events.filter(e => [e.title,e.description,e.venue].some(v => String(v || '').toLowerCase().includes(q))); }
  events.sort((a,b) => new Date(a.startsAt) - new Date(b.startsAt));
  res.json({ events: events.map(e => ({ ...store.populateEvent(e), registeredCount: store.registrations.forEvent(e.id).length })) });
});
router.get('/student/mine', requireAuth, requireRole('student'), (req, res) => {
  const registrations = store.registrations.forStudent(req.user.id).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).map(store.populateRegistration);
  res.json({ registrations });
});
router.get('/:id', (req, res) => {
  const event = store.events.findById(req.params.id);
  if (!event || event.status !== 'approved') return res.status(404).json({ error: 'Event not found' });
  res.json({ event: { ...store.populateEvent(event), registeredCount: store.registrations.forEvent(event.id).length } });
});
router.post('/:id/register', requireAuth, requireRole('student'), (req, res, next) => {
  try {
    const event = store.events.findById(req.params.id);
    if (!event || event.status !== 'approved') return res.status(404).json({ error: 'Event not found or not open for registration' });
    if (store.registrations.forEvent(event.id).length >= Number(event.capacity)) return res.status(409).json({ error: 'This event is full' });
    const passToken = crypto.randomBytes(24).toString('hex');
    const registration = store.registrations.create({ eventId: event.id, studentId: req.user.id, passToken });
    res.status(201).json({ message: 'Registration successful', registration: { id: registration.id, passToken, event: event.title } });
  } catch (e) { if (e.code === 11000) return res.status(409).json({ error: 'You are already registered for this event' }); next(e); }
});
router.post('/registrations/:token/check-in', requireAuth, requireRole('organizer', 'admin'), (req, res) => {
  const registration = store.registrations.findByToken(req.params.token);
  if (!registration) return res.status(404).json({ error: 'Pass not found' });
  const event = store.events.findById(registration.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (req.user.role === 'organizer' && event.organizerId !== req.user.id) return res.status(403).json({ error: "This pass belongs to another organizer's event" });
  if (registration.attendedAt) return res.status(409).json({ error: 'This pass has already been checked in' });
  store.registrations.update(registration.id, { attendedAt: new Date().toISOString() });
  res.json({ message: 'Attendance verified', event: event.title });
});
module.exports = router;
