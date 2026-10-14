const router = require('express').Router();
const store = require('../lib/store');
const { requireAuth, requireRole } = require('../middleware/auth');
router.use(requireAuth, requireRole('admin'));
router.get('/summary', (_req, res) => { const users=store.users.all(), events=store.events.all(), regs=store.registrations.all(), attended=regs.filter(r=>r.attendedAt).length; res.json({ users:users.length, events:events.length, registrations:regs.length, attended, attendanceRate:regs.length?Math.round(attended/regs.length*100):0, pending:events.filter(e=>e.status==='pending').length }); });
router.get('/pending-events', (_req, res) => res.json({ events:store.events.all().filter(e=>e.status==='pending').sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).map(store.populateEvent) }));
router.patch('/events/:id/review', (req, res) => { const {decision,reason}=req.body; if(!['approved','rejected'].includes(decision)) return res.status(400).json({error:'Decision must be approved or rejected'}); const event=store.events.findById(req.params.id); if(!event) return res.status(404).json({error:'Event not found'}); if(event.status!=='pending') return res.status(409).json({error:'Only pending events can be reviewed'}); const updated=store.events.update(event.id,{status:decision,rejectionReason:decision==='rejected'?String(reason||'Please revise and resubmit'):null}); res.json({event:updated}); });
router.get('/users', (_req,res) => res.json({users:store.users.all().map(store.userPublic).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))}));
router.patch('/users/:id/verify-club', (req,res) => { const user=store.users.findById(req.params.id); if(!user||user.role!=='organizer') return res.status(404).json({error:'Organizer not found'}); res.json({user:store.userPublic(store.users.update(user.id,{clubVerified:Boolean(req.body.verified)}))}); });
// Local-development helper: promote an account to organizer. Remove/disable before production.
router.patch('/users/:id/role', (req,res) => { if(!['student','organizer'].includes(req.body.role)) return res.status(400).json({error:'Role must be student or organizer'}); const user=store.users.findById(req.params.id); if(!user) return res.status(404).json({error:'User not found'}); res.json({user:store.userPublic(store.users.update(user.id,{role:req.body.role,clubVerified:false}))}); });
module.exports = router;
