require('dotenv').config();
const bcrypt = require('bcryptjs');
const store = require('../lib/store');
(async () => {
  const email = String(process.env.ADMIN_EMAIL || 'admin@eventplanner.local').toLowerCase().trim();
  const password = String(process.env.ADMIN_PASSWORD || 'LocalAdmin123!Change');
  if (password.length < 12) throw new Error('Use an admin password of at least 12 characters.');
  if (store.users.findByEmail(email)) { console.log(`An account already exists for ${email}; no changes made.`); return; }
  store.users.create({ name:'Event Planner Admin', email, passwordHash:await bcrypt.hash(password,12), role:'admin', clubVerified:true });
  console.log(`Local admin created. Email: ${email}`);
  if (!process.env.ADMIN_PASSWORD) console.log('Temporary local password: LocalAdmin123!Change — change it before using real data.');
})().catch(e=>{console.error(e.message);process.exit(1);});
