/**
 * One-off migration: hash any Admin password that is still stored in cleartext.
 *
 *   node migrate-passwords.js
 *
 * Safe to run more than once. Records whose password already starts with "$2"
 * (a bcrypt hash) are left untouched, so a second run reports 0 migrated.
 *
 * Requires MONGODB_URI in backend/.env or the environment.
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = 12;

const adminSchema = new mongoose.Schema({
  id: String,
  email: String,
  password: String,
  role: String,
  mustChangePassword: Boolean
}, { collection: 'admins' });

const Admin = mongoose.model('Admin', adminSchema);

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Aborting without touching anything.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  const admins = await Admin.find({});
  console.log(`Found ${admins.length} admin record(s).`);

  let migrated = 0;
  let skipped = 0;
  let broken = 0;

  for (const admin of admins) {
    if (!admin.password) {
      console.warn(`  ! ${admin.email || admin.id}: no password stored, skipping.`);
      broken++;
      continue;
    }

    if (admin.password.startsWith('$2')) {
      skipped++;
      continue;
    }

    admin.password = await bcrypt.hash(admin.password, BCRYPT_ROUNDS);
    await admin.save();
    console.log(`  + ${admin.email || admin.id}: hashed.`);
    migrated++;
  }

  console.log('');
  console.log('----------------------------------------');
  console.log(`Migrated:            ${migrated}`);
  console.log(`Already hashed:      ${skipped}`);
  if (broken) console.log(`Skipped (no password): ${broken}`);
  console.log('----------------------------------------');

  if (migrated > 0) {
    console.log('');
    console.log('Note: passwords are now case-sensitive. Anyone who was signing in with');
    console.log('the wrong casing will need to use the exact password from now on.');
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Migration failed:', err);
  try { await mongoose.disconnect(); } catch (e) {}
  process.exit(1);
});
