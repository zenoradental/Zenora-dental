# Zenora Dental — Fix Brief

Paste this whole file into Claude Code inside the `ZENORA DENTAL` project folder.

---

You are working in the `ZENORA DENTAL` repo. It has three parts:

- `backend/server.js` — Express 5 + Mongoose, deployed as a Vercel serverless function
- `ZENORA ADMIN/` — React 19 + TypeScript + Vite admin dashboard
- `ZEMORA DENTAL/` — static HTML patient site

Fix the issues below **in priority order**. Do not refactor anything not listed. After each priority block, tell me what you changed and what I need to do manually (env vars, redeploys, DB actions).

---

# P0 — SECURITY. Do these first, nothing else until they're done.

## P0.1 — Every API route is unauthenticated

`backend/server.js` has no auth middleware. The only `app.use()` calls are `cors()`, `express.json()`, a DB connector, and static file serving. Every route — `GET/PUT/PATCH/DELETE /api/appointments`, `/api/admins`, `/api/settings`, `/api/doctors` — is publicly reachable.

I confirmed this live: `GET https://zenora-backend-black.vercel.app/api/appointments` returns ~87 KB containing **187 records**, each with `patientName`, `phone`, `email`, `age`, `gender`, `symptoms`, `medicalHistory`. No credentials required.

**Do this:**

1. Add `jsonwebtoken` to `backend/package.json`.
2. On successful `POST /api/auth/login` (line ~807), sign a JWT containing `{ id, email, role }`, expiry 8h, secret from `process.env.JWT_SECRET`. Return it as `token` in the response body.
3. Write a `requireAuth` middleware that reads `Authorization: Bearer <token>`, verifies it, and puts the payload on `req.user`. Return 401 on missing/invalid.
4. Write a `requireMasterAdmin` middleware that additionally checks `req.user.role === 'Master Admin'`.
5. Apply `requireAuth` to **every** `/api/*` route **except** these three public ones:
   - `POST /api/appointments` (patients book)
   - `GET /api/appointments/:id` (patients check status — see P0.2)
   - `GET /api/availability` (new — see P0.2)
6. Apply `requireMasterAdmin` to all of `/api/admins/*` and `PATCH /api/settings`.
7. Never trust a role sent from the client. Read it only from the verified JWT.

## P0.2 — The public booking page downloads the entire patient database

`ZEMORA DENTAL/book-appointment.html` lines ~1143, 1146, 1211, 1233 call `fetch('https://zenora-backend-black.vercel.app/api/appointments')` just to check which slots are taken. That endpoint URL is therefore visible in the page source of a public website, and it returns every patient's full record.

**Do this:**

1. Add a new public endpoint in `server.js`:
   ```
   GET /api/availability?date=YYYY-MM-DD
   ```
   It must return **only** an array of booked time strings for that date, e.g. `{ "booked": ["09:00 AM", "02:00 PM"] }`. Exclude appointments with `status === 'Cancelled'`. It must return **no** patient fields whatsoever.
2. Replace all four `fetch` calls in `book-appointment.html` with calls to `/api/availability`.
3. Harden `GET /api/appointments/:id`: require a `phone` query parameter and verify its last 4 digits match the record's phone. Return 404 (not 403) on mismatch so IDs can't be enumerated. Update `ZEMORA DENTAL/check-status.html` to collect the phone number alongside the tracking ID.

## P0.3 — Unauthenticated endpoint that wipes the whole database

`backend/server.js` line ~754:

```js
app.delete('/api/appointments', async (req, res) => {
  await Appointment.deleteMany({});
```

**Delete this route entirely.**

Then convert all remaining deletes to soft deletes: add `deletedAt: { type: Date, default: null }` to the `appointmentSchema`, have `DELETE /api/appointments/:id` and `DELETE /api/patients/:id` set `deletedAt` instead of removing the document, and add `deletedAt: null` to the filter of every read query.

## P0.4 — Passwords are plaintext and compared case-insensitively

`backend/server.js` line ~812:

```js
if (admin && (admin.password === password || admin.password.toLowerCase() === password.toLowerCase()))
```

Two separate bugs: passwords are stored in cleartext, and `Zenora2010!` and `zenora2010!` both authenticate.

**Do this:**

1. Add `bcrypt` to `backend/package.json`.
2. Hash with cost factor 12 on admin creation (`POST /api/admins`) and on password change (`PATCH /api/admins/:id/password`).
3. Replace the login comparison with `await bcrypt.compare(password, admin.password)`. **Delete the `.toLowerCase()` branch completely** — do not preserve that behaviour.
4. Write `backend/migrate-passwords.js`: a one-off script that loads every Admin whose password isn't already a bcrypt hash (doesn't start with `$2`) and hashes it in place. Print how many it migrated.

## P0.5 — Hardcoded default admin credentials

`backend/server.js` line ~315 seeds a known Master Admin on any empty database:

```js
await Admin.create({ id: 'ADM0001', email: 'admin@zenoradental.com',
                     password: 'zenoradental2010', role: 'Master Admin' });
```

These credentials are in the source, in `README.md`, and in the backup zips.

**Do this:** generate a cryptographically random 16-character password at first boot, hash it, `console.log` the plaintext exactly once with a clear "SAVE THIS NOW — shown only once" banner, and add a `mustChangePassword: true` flag on the Admin schema that forces a password change on first login.

## P0.6 — Admin "login" is a client-side boolean

`ZENORA ADMIN/src/App.tsx` line ~209:

```js
return localStorage.getItem('adminLoggedIn') === 'true' || sessionStorage.getItem('adminLoggedIn') === 'true';
```

Typing `localStorage.setItem('adminLoggedIn','true')` in the browser console grants full dashboard access.

**Do this:** store the JWT from P0.1 instead of a boolean. On app load, validate it against a new `GET /api/auth/me` endpoint rather than trusting its presence. Attach `Authorization: Bearer <token>` to every API call in the admin app. On a 401 from any call, clear the token and redirect to login. Derive the Master Admin UI gating (`App.tsx` lines ~1735, 1813, 1841) from the server response, not from `localStorage`.

## P0.7 — CORS is wide open and TLS verification is disabled

- Line ~14: `app.use(cors());` — allows any origin. Combined with P0.1, any website can read the patient database from a visitor's browser.
- Lines ~41 and ~57: `rejectUnauthorized: false` in the SMTP TLS options — disables certificate validation, making SMTP credentials interceptable.

**Do this:** change CORS to an explicit allowlist from `process.env.ALLOWED_ORIGINS` (comma-separated), with `credentials: true`. Remove both `rejectUnauthorized: false` occurrences.

## P0.8 — No rate limiting

Nothing throttles `POST /api/appointments` (a script can fill every slot for a year, or flood the confirmation-email path) or `POST /api/auth/login` (unlimited credential stuffing).

**Do this:** add `express-rate-limit`. Login: 5 requests per 15 min per IP. Booking: 10 per hour per IP. Add a hidden honeypot field to the booking form and silently reject submissions that fill it.

---

# P1 — Do before any paying clinic goes live

## P1.1 — The Analytics dashboard shows fabricated revenue

`ZENORA ADMIN/src/AnalyticsDashboard.tsx` line ~50:

```js
// Generate some realistic looking fake revenue data based on appointments
const baseData = [
  { name: 'Jan', revenue: 42500, appointments: 120 },
  { name: 'Feb', revenue: 48200, appointments: 135 },
  ...
```

"All-Time Revenue", "Monthly Revenue", "Average Value", "Projected Annual" and the Revenue Growth chart all derive from these constants. They also render in `$` while `InvoiceModal.tsx` renders in `₹`.

**Do this, in this order:**

1. **Immediately:** render a prominent banner at the top of the Analytics tab reading `SAMPLE DATA — NOT YOUR REVENUE`, gated behind a `VITE_ANALYTICS_DEMO_MODE` env flag that defaults to `true`.
2. Add `price: { type: Number, default: null }` and `currency: { type: String, default: 'INR' }` to `appointmentSchema`.
3. Create a `ServicePrice` model (`clinicId`, `serviceName`, `price`) and a settings screen to manage it. On `PATCH /api/appointments/:id/status` when status becomes `Completed`, stamp the appointment's `price` from the current service price.
4. Rewrite `AnalyticsDashboard.tsx` to compute every figure from actual completed appointments. **Delete `baseData` entirely.** If there's no data yet, show an empty state — never a fabricated number.
5. Format all currency as `₹` using `Intl.NumberFormat('en-IN')`.

## P1.2 — Single-tenant: cannot serve a second clinic

No `clinicId` exists on `Appointment`, `Doctor`, `Admin`, or `Setting`. `Setting` is a singleton (`Setting.findOne()` with no filter). Clinic identity is hardcoded throughout `server.js`:

- Line ~150: brand name `Zenora Dental` in the email template
- Lines ~216–217: phone `+91 98765 43210` and `hello@zenoradental.com`
- Lines ~243, 454, 533, 607, 695: from-address `zenoracare@whitefoxofficial.space`
- Line ~564: Google review CTA points to `https://g.page/review/placeholder-link` — **a dead placeholder that goes out in every "visit completed" email right now**

**Do this now (deploy-per-clinic):** move all clinic identity into env vars — `CLINIC_NAME`, `CLINIC_PHONE`, `CLINIC_EMAIL`, `CLINIC_FROM_ADDRESS`, `CLINIC_REVIEW_URL`, `FRONTEND_URL`. Replace every hardcoded occurrence. If `CLINIC_REVIEW_URL` is unset, omit the review CTA rather than emitting a broken link. Then write `DEPLOY_CLINIC.md` documenting the full per-clinic deployment: env vars, Vercel project, Mongo database, DNS.

**Do not build multi-tenancy yet.** Note in the doc that it's needed around client #8.

## P1.3 — Race condition and enumerable IDs

`backend/server.js` line ~362, `generateId()` reads the most recent appointment and adds 1. Two simultaneous bookings generate the same ID; `appointmentId` is `unique`, so the second booking throws a 500 at the patient. IDs are also sequential and guessable.

**Do this:** create a `Counter` collection and use an atomic `findOneAndUpdate` with `$inc` and `upsert: true`. Make the public tracking ID `APT` + sequence + 4 random alphanumerics (e.g. `APT1042K7XQ`).

## P1.4 — No input validation

No route validates anything. `age` can be `NaN`, strings have no length caps, emails are never format-checked. `symptoms` and `medicalHistory` are stored raw and interpolated directly into HTML emails.

**Do this:** add `zod` schemas for every route body and param. Cap string lengths. HTML-escape all user-supplied values before interpolating into `generateEmailHTML()`.

## P1.5 — No monitoring, backups, or audit trail

**Do this:** add Sentry to both backend and admin. Add an `auditLog` collection (actor, action, entity, entityId, before, after, timestamp) written on every status change, doctor assignment, edit and delete. Document MongoDB Atlas continuous backup setup and a tested restore procedure in `DEPLOY_CLINIC.md`.

---

# P2 — Demo site content (fast, but visible to every prospect)

All in `ZEMORA DENTAL/`. These appear on the live demo at `https://zenoradental.whitefoxofficial.space/`.

1. **`+91 XXXXXXXXXX`** appears as a literal placeholder in the header, the footer, and the "Emergency Contact" block on every page. Replace with a real number across all HTML files.
2. **Canonical tags point to a dead domain.** Every page has `<link rel="canonical" href="https://zenoradental.com/...">` and matching `og:url`. That domain returns nothing. Point them at the live host, or drive them from a single build-time variable.
3. **Broken link:** "View All Doctors" on `index.html` points to `https://about#team-members`. Should be `about.html#team-members`.
4. **All three doctors are labelled "Pediatric Dentist"** — Dr. Olivia Thompson, Dr. Rishi, Dr. Emman Collins. Give them distinct, plausible specialisations (General Dentist, Orthodontist, Oral Surgeon).
5. **Remove the "Admin Portal" link from the public footer** on every page. Keep the route working; just stop advertising it to visitors.
6. **The insurance FAQ is US-framed:** "Yes, we accept most major insurance plans and assist patients in maximizing their benefits." Rewrite for an Indian clinic — cashless tie-ups, EMI options, reimbursement paperwork.
7. **All social links are `#`.** Either point them somewhere real or remove the block.
8. **Testimonial name "Kristin Watson"** is a widely recognised UI placeholder name. Replace all three testimonial names with plausible Indian names.
9. Remove `nav_temp.html` from the deployed directory.

---

# P3 — Demo data hygiene (do this before I send the demo link to anyone)

The demo database currently holds 187 real-looking appointment records that are publicly downloadable.

**Do this:**

1. Write `backend/reset-demo.js` that wipes all appointments and seeds ~12 obviously-fake ones: names like `Demo Patient One`, phones in the `+91 90000 000XX` range, emails `@example.com`, and bland symptom text. Spread them across today and the next few days, across all four Command Center stages and all four statuses, so the dashboard demos well.
2. Confirm the reset ran and `GET /api/appointments` now requires auth.

---

# Order of work

1. All of **P0**, then redeploy backend and admin
2. **P3**, so the demo is clean
3. **P2**, content pass on the static site
4. **P1**, before the first paying clinic

After P0 and P3, tell me explicitly:
- the new `GET /api/appointments` response for an unauthenticated request (should be 401)
- the new `GET /api/availability?date=...` response shape
- every env var I need to set in Vercel, for both the backend and the admin projects
