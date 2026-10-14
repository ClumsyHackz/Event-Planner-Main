const router = require('express').Router();
const store = require('../lib/store');
const { requireAuth, requireRole } = require('../middleware/auth');
router.use(requireAuth, requireRole('organizer', 'admin'));
router.get('/events', (req, res) => { const events = store.events.all().filter(e => req.user.role === 'admin' || e.organizerId === req.user.id).sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)); res.json({ events: events.map(store.populateEvent) }); });
router.post('/events', (req, res) => {
  if (req.user.role !== 'admin' && !req.user.clubVerified) return res.status(403).json({ error: 'Your club must be verified before publishing events' });
  const { title, description, category, venue, startsAt, endsAt, capacity, action } = req.body;
  if (!title || !description || !venue || !startsAt || !Number.isFinite(Number(capacity)) || Number(capacity) < 1) return res.status(400).json({ error: 'Title, description, venue, start date, and positive capacity are required' });
  const event = store.events.create({ title: String(title).trim(), description: String(description), category: category || 'Other', venue: String(venue).trim(), startsAt: new Date(startsAt).toISOString(), endsAt: endsAt ? new Date(endsAt).toISOString() : null, capacity: Number(capacity), organizerId: req.user.id, status: action === 'submit' ? 'pending' : 'draft' });
  res.status(201).json({ event: store.populateEvent(event) });
});
router.patch('/events/:id/submit', (req, res) => { const event = store.events.findById(req.params.id); if (!event || (req.user.role !== 'admin' && event.organizerId !== req.user.id)) return res.status(404).json({ error: 'Event not found' }); if (req.user.role !== 'admin' && !req.user.clubVerified) return res.status(403).json({ error: 'Your club must be verified first' }); const updated = store.events.update(event.id, { status: 'pending', rejectionReason: null }); res.json({ event: updated }); });
router.get('/events/:id/attendees', (req, res) => { const event = store.events.findById(req.params.id); if (!event || (req.user.role !== 'admin' && event.organizerId !== req.user.id)) return res.status(404).json({ error: 'Event not found' }); const attendees = store.registrations.forEvent(event.id).map(store.populateRegistration).map(r => ({ id:r.id, createdAt:r.createdAt, attendedAt:r.attendedAt, student:r.student })); res.json({ attendees }); });
module.exports = router;
