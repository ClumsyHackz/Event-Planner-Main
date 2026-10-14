// Small JSON-file database for local development. Not intended for production/multi-instance hosting.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const file = path.join(__dirname, '..', 'data', 'db.json');
let state;
function load() {
  if (!state) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    try { state = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (e) {
      if (e.code !== 'ENOENT' && !(e instanceof SyntaxError)) throw e;
      state = { users: [], events: [], registrations: [] };
      persist();
    }
    for (const key of ['users', 'events', 'registrations']) if (!Array.isArray(state[key])) state[key] = [];
  }
  return state;
}
function persist() { fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n', { mode: 0o600 }); }
function id() { return crypto.randomBytes(12).toString('hex'); }
function copy(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
const now = () => new Date().toISOString();
function userPublic(user) { if (!user) return null; const { passwordHash, ...safe } = user; return copy(safe); }
function populateEvent(event) { if (!event) return null; const s = load(); return { ...copy(event), organizer: userPublic(s.users.find(u => u.id === event.organizerId)) }; }
function populateRegistration(reg) { if (!reg) return null; const s = load(); return { ...copy(reg), event: populateEvent(s.events.find(e => e.id === reg.eventId)), student: userPublic(s.users.find(u => u.id === reg.studentId)) }; }
const users = {
 all() { return copy(load().users); },
 findById(uid) { return copy(load().users.find(u => u.id === String(uid)) || null); },
 findByEmail(email) { return copy(load().users.find(u => u.email === String(email).toLowerCase().trim()) || null); },
 create(input) { const s = load(); const email = String(input.email).toLowerCase().trim(); if (s.users.some(u => u.email === email)) { const e = new Error('Duplicate email'); e.code = 11000; throw e; } const t = now(); const row = { id: id(), createdAt: t, updatedAt: t, role: 'student', clubVerified: false, ...copy(input), email }; s.users.push(row); persist(); return copy(row); },
 update(uid, patch) { const s = load(), u = s.users.find(x => x.id === String(uid)); if (!u) return null; Object.assign(u, copy(patch), { updatedAt: now() }); persist(); return copy(u); }
};
const events = {
 all() { return copy(load().events); },
 findById(eid) { return copy(load().events.find(e => e.id === String(eid)) || null); },
 create(input) { const t = now(), row = { id: id(), createdAt: t, updatedAt: t, status: 'draft', category: 'Other', ...copy(input) }; load().events.push(row); persist(); return copy(row); },
 update(eid, patch) { const e = load().events.find(x => x.id === String(eid)); if (!e) return null; Object.assign(e, copy(patch), { updatedAt: now() }); persist(); return copy(e); },
 delete(eid) { const s = load(), i = s.events.findIndex(e => e.id === String(eid)); if (i < 0) return false; s.events.splice(i, 1); persist(); return true; }
};
const registrations = {
 all() { return copy(load().registrations); },
 findById(rid) { return copy(load().registrations.find(r => r.id === String(rid)) || null); },
 findByToken(token) { return copy(load().registrations.find(r => r.passToken === String(token)) || null); },
 forEvent(eid) { return copy(load().registrations.filter(r => r.eventId === String(eid))); },
 forStudent(uid) { return copy(load().registrations.filter(r => r.studentId === String(uid))); },
 create(input) { const s = load(); if (s.registrations.some(r => r.eventId === String(input.eventId) && r.studentId === String(input.studentId))) { const e = new Error('Duplicate registration'); e.code = 11000; throw e; } const t = now(), row = { id: id(), createdAt: t, updatedAt: t, attendedAt: null, ...copy(input) }; s.registrations.push(row); persist(); return copy(row); },
 update(rid, patch) { const r = load().registrations.find(x => x.id === String(rid)); if (!r) return null; Object.assign(r, copy(patch), { updatedAt: now() }); persist(); return copy(r); }
};
module.exports = { users, events, registrations, id, userPublic, populateEvent, populateRegistration, persist };
