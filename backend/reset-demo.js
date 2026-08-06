/**
 * Reset the demo database to a small set of obviously-fake appointments.
 *
 *   node reset-demo.js            # soft-delete existing records, then seed
 *   node reset-demo.js --hard     # permanently remove existing records, then seed
 *
 * By default this soft-deletes (sets deletedAt) rather than destroying data, so a
 * mistaken run against the wrong database is recoverable. Pass --hard for a real purge.
 *
 * The seeded records are unmistakably fake: "Demo Patient" names, +91 90000 000XX
 * phone numbers, @example.com addresses, and bland symptom text. They are spread
 * across today and the next few days and cover all four Command Center stages
 * (Waiting Room, Checkup, Treatment, Discharged) and all four statuses
 * (Pending, Confirmed, Completed, Cancelled) so the dashboard demos well.
 *
 * Requires MONGODB_URI in backend/.env or the environment.
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');

const HARD = process.argv.includes('--hard');

const appointmentSchema = new mongoose.Schema({
  appointmentId: String,
  patientName: String,
  age: Number,
  gender: String,
  phone: String,
  email: String,
  service: String,
  symptoms: String,
  doctor: String,
  appointmentDate: String,
  appointmentTime: String,
  status: String,
  stage: String,
  address: String,
  medicalHistory: String,
  createdAt: Date,
  deletedAt: { type: Date, default: null }
}, { collection: 'appointments' });

const Appointment = mongoose.model('Appointment', appointmentSchema);

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 1000 }
}, { collection: 'counters' });
const Counter = mongoose.model('Counter', counterSchema);

/** Local date N days from today as YYYY-MM-DD (not UTC — the dashboard filters on local dates). */
const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DEMO = [
  // --- Today: one card in each Command Center column ---
  { name: 'Demo Patient One',   age: 34, gender: 'Female', day: 0, time: '09:00 AM', service: 'General Checkup',      status: 'Confirmed', stage: 'Waiting Room', doctor: 'Dr. Sarah Jenkins',    symptoms: 'Routine six-month checkup.' },
  { name: 'Demo Patient Two',   age: 28, gender: 'Male',   day: 0, time: '10:00 AM', service: 'Teeth Cleaning',       status: 'Confirmed', stage: 'Checkup',      doctor: 'Dr. Michael Chen',     symptoms: 'Mild sensitivity on the upper left side.' },
  { name: 'Demo Patient Three', age: 45, gender: 'Male',   day: 0, time: '11:30 AM', service: 'Root Canal',           status: 'Confirmed', stage: 'Treatment',    doctor: 'Dr. James Wilson',     symptoms: 'Persistent ache in a lower molar.' },
  { name: 'Demo Patient Four',  age: 52, gender: 'Female', day: 0, time: '12:30 PM', service: 'Tooth Extraction',     status: 'Completed', stage: 'Discharged',   doctor: 'Dr. James Wilson',     symptoms: 'Wisdom tooth removal, follow-up booked.' },

  // --- Today: remaining statuses ---
  { name: 'Demo Patient Five',  age: 19, gender: 'Female', day: 0, time: '02:00 PM', service: 'General Checkup',      status: 'Pending',   stage: 'Waiting Room', doctor: 'Unassigned',           symptoms: 'First visit, general assessment requested.' },
  { name: 'Demo Patient Six',   age: 61, gender: 'Male',   day: 0, time: '03:30 PM', service: 'Dental Implants',      status: 'Cancelled', stage: 'Waiting Room', doctor: 'Unassigned',           symptoms: 'Rescheduling for a later date.' },

  // --- Tomorrow ---
  { name: 'Demo Patient Seven', age: 24, gender: 'Female', day: 1, time: '09:30 AM', service: 'Teeth Whitening',      status: 'Confirmed', stage: 'Waiting Room', doctor: 'Dr. Sarah Jenkins',    symptoms: 'Cosmetic whitening consultation.' },
  { name: 'Demo Patient Eight', age: 37, gender: 'Male',   day: 1, time: '11:00 AM', service: 'Orthodontics',         status: 'Pending',   stage: 'Waiting Room', doctor: 'Unassigned',           symptoms: 'Interested in clear aligners.' },
  { name: 'Demo Patient Nine',  age: 8,  gender: 'Male',   day: 1, time: '04:00 PM', service: 'Pediatric Dentistry',  status: 'Confirmed', stage: 'Waiting Room', doctor: 'Dr. Emily Rodriguez',  symptoms: 'Routine checkup, accompanied by a parent.' },

  // --- Day after tomorrow ---
  { name: 'Demo Patient Ten',    age: 30, gender: 'Female', day: 2, time: '10:30 AM', service: 'Teeth Cleaning',      status: 'Confirmed', stage: 'Waiting Room', doctor: 'Dr. Michael Chen',    symptoms: 'Scaling and polishing.' },
  { name: 'Demo Patient Eleven', age: 47, gender: 'Male',   day: 2, time: '01:00 PM', service: 'Gum Treatment',       status: 'Pending',   stage: 'Waiting Room', doctor: 'Unassigned',          symptoms: 'Bleeding gums when brushing.' },

  // --- Three days out ---
  { name: 'Demo Patient Twelve', age: 55, gender: 'Female', day: 3, time: '09:00 AM', service: 'Dental Crowns',       status: 'Confirmed', stage: 'Waiting Room', doctor: 'Dr. Sarah Jenkins',   symptoms: 'Crown fitting for a repaired molar.' }
];

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Aborting without touching anything.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  const before = await Appointment.countDocuments({ deletedAt: null });
  console.log(`${before} visible appointment(s) currently in the database.`);

  if (HARD) {
    const del = await Appointment.deleteMany({});
    console.log(`Permanently removed ${del.deletedCount} appointment record(s).`);
  } else {
    const soft = await Appointment.updateMany(
      { deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );
    console.log(`Soft-deleted ${soft.modifiedCount} appointment record(s) (recoverable — deletedAt was set).`);
  }

  const docs = DEMO.map((d, i) => {
    const seq = 9000 + i + 1;
    return {
      appointmentId: `APTDEMO${seq}`,
      patientName: d.name,
      age: d.age,
      gender: d.gender,
      phone: `+91 90000 000${String(i + 1).padStart(2, '0')}`,
      email: `demo.patient.${i + 1}@example.com`,
      service: d.service,
      symptoms: d.symptoms,
      doctor: d.doctor,
      appointmentDate: dayOffset(d.day),
      appointmentTime: d.time,
      status: d.status,
      stage: d.stage,
      address: 'Demo address, not a real location',
      medicalHistory: 'No known allergies. Demo record.',
      createdAt: new Date(Date.now() - (DEMO.length - i) * 60 * 1000),
      deletedAt: null
    };
  });

  await Appointment.insertMany(docs);
  console.log(`Seeded ${docs.length} demo appointment(s).`);

  // Keep the ID counter ahead of the seeded demo IDs so new bookings do not collide.
  await Counter.findOneAndUpdate(
    { _id: 'appointmentId' },
    { $max: { seq: 9000 + docs.length } },
    { upsert: true }
  );

  const after = await Appointment.countDocuments({ deletedAt: null });
  console.log('');
  console.log('----------------------------------------');
  console.log(`Visible appointments before: ${before}`);
  console.log(`Visible appointments after:  ${after}`);
  console.log('----------------------------------------');

  const byStatus = {};
  const byStage = {};
  for (const d of docs) {
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    byStage[d.stage] = (byStage[d.stage] || 0) + 1;
  }
  console.log('Statuses:', byStatus);
  console.log('Stages:  ', byStage);
  console.log('');
  console.log('Reset complete. GET /api/appointments requires a bearer token, so this');
  console.log('data is only visible to a signed-in admin.');

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Reset failed:', err);
  try { await mongoose.disconnect(); } catch (e) {}
  process.exit(1);
});
