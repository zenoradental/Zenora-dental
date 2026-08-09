# Zenora Dental — Production Readiness & Sales Risk Report

**Prepared for:** WhiteFox AI
**Date:** 6 August 2026
**Scope:** `backend/server.js`, `ZENORA ADMIN/src/*`, `ZEMORA DENTAL/*.html`
**Purpose:** Establish what is safe to sell, safe to demo, and what must be fixed before taking money from a clinic.

---

## Read this part first

You asked for a kit to license this to many clinics. I built it. But three findings below mean **you should not sign a paid clinic onto the current build as-is**. They are all fixable — most in a focused week — and the sales kit is written so you can start selling into a pilot while you fix them.

The three:

1. **Every API endpoint is unauthenticated.** Anyone with the URL can download every patient's medical history.
2. **The Analytics revenue dashboard is hardcoded fake data.** Demoing it as real is a fraud risk.
3. **The system is single-tenant.** You cannot serve clinic #2 without a data-model change.

Details, evidence, and fixes below.

---

## SEVERITY 1 — Blockers. Do not onboard a paying clinic until these are closed.

### 1.1 No authentication on any API route

**Evidence:** `backend/server.js`. There is no auth middleware anywhere in the file. Every route — `GET /api/appointments`, `PUT`, `PATCH`, `DELETE`, `/api/admins`, `/api/settings` — is reachable by anyone.

**Why it's worse than it sounds:** `ZEMORA DENTAL/book-appointment.html` line 1143 calls `fetch('https://zenora-backend-black.vercel.app/api/appointments')` from the public booking page to check slot availability. The endpoint URL is therefore visible in the page source of a public website. That endpoint returns the complete record for every patient:

```
patientName, age, gender, phone, email, service,
symptoms, medicalHistory, address, doctor, status
```

Anyone who opens the booking page, presses F12, and looks at the Network tab has the clinic's entire patient database. No exploit required.

**Legal exposure (India):** This is sensitive personal data under the **Digital Personal Data Protection Act, 2023**. A clinic that suffers a breach through your software will look to its vendor. Your contract should not be the first time you think about this.

**Fix:**
- Add JWT (or session cookie) auth middleware; apply to every route except `POST /api/appointments` and `GET /api/appointments/:id`.
- Build a dedicated public endpoint `GET /api/availability?date=YYYY-MM-DD` that returns **only an array of booked time strings** — no patient data. Point the booking page at that instead.
- Scope `GET /api/appointments/:id` to require the tracking ID *plus* a second factor (phone last 4 digits), otherwise sequential IDs make it enumerable.

---

### 1.2 Unauthenticated total-wipe endpoint

**Evidence:** `server.js` line 754.

```js
app.delete('/api/appointments', async (req, res) => {
  await Appointment.deleteMany({});
```

One unauthenticated HTTP DELETE destroys every appointment record in the database. There is no auth, no confirmation, no soft-delete, and no documented backup.

**Fix:** Remove this endpoint entirely, or gate it behind Master Admin auth plus a typed confirmation. Convert all deletes to soft-deletes (`deletedAt` timestamp). Enable MongoDB Atlas continuous backups before any clinic's real data lands in it.

---

### 1.3 Analytics revenue figures are fabricated — **do not demo this tab**

**Evidence:** `ZENORA ADMIN/src/AnalyticsDashboard.tsx` line 50, verbatim comment in your own code:

```js
// Generate some realistic looking fake revenue data based on appointments
const baseData = [
  { name: 'Jan', revenue: 42500, appointments: 120 },
  { name: 'Feb', revenue: 48200, appointments: 135 },
  ...
```

"All-Time Revenue", "Monthly Revenue", "Average Value", "Projected Annual" and the Revenue Growth chart are computed from these hardcoded constants, not from clinic data. There is no `price` field on the Appointment schema, so real revenue **cannot** currently be derived.

It also renders in `$` while your Invoice module renders in `₹`, so the currency is wrong for the Indian market too.

**Why this is a sales problem, not just a bug:** If you demo this tab to a clinic owner as "your revenue dashboard", they will pay partly for that. When they log in on week two and see ₹42,500 for a January they weren't your customer in, you have a refund, a chargeback, and a reference customer who tells other dentists. Fabricated financial reporting sold to a healthcare business is not a bug you can apologise your way out of.

**Fix (in priority order):**
1. **Today, before any demo:** hide the Analytics tab behind a feature flag, or label it clearly `SAMPLE DATA — ILLUSTRATIVE ONLY` in the UI.
2. Add `price: Number` and `currency: String` to the Appointment schema.
3. Add a per-clinic service→price table so revenue is computed from actual completed appointments.
4. Switch all currency formatting to ₹ / `en-IN`.

**Until then:** the sales scripts in this kit demo the Command Center and the email automation instead. That is deliberate. Follow them.

---

### 1.4 Single-tenant architecture — blocks the entire licensing model

**Evidence:** No `clinicId` / `tenantId` field exists on `Appointment`, `Doctor`, `Admin`, or `Setting`. `Setting` is a **singleton** — `Setting.findOne()` with no filter. Clinic identity is hardcoded in `server.js`:

- Brand name `Zenora Dental` (email templates, line 150)
- From address `zenoracare@whitefoxofficial.space` (lines 243, 454, 533, 607, 695)
- Phone `+91 98765 43210` and `hello@zenoradental.com` (lines 216–217)
- Google review CTA → `https://g.page/review/placeholder-link` (line 564) — **this is a dead placeholder link that goes out in every "visit completed" email**

You picked "license it to many clinics." With this data model, clinic #2 requires a **completely separate deployment**: separate Vercel project, separate MongoDB cluster, separate env vars, separate SMTP identity. That is a per-clinic manual ops burden that stops being viable somewhere around client #5.

**Two honest paths:**

| Path | What it means | Effort | Best for |
|---|---|---|---|
| **A. Deploy-per-clinic** (do this first) | Keep single-tenant. Script the deployment. Move all clinic identity into env vars. Charge a setup fee that covers your time. | ~1 week | Clients 1–10 |
| **B. True multi-tenant** (do this at ~client 8) | Add `clinicId` to every model + index, a `Clinic` collection, tenant resolution by subdomain, per-tenant settings and branding, tenant-scoped queries everywhere. | ~3–4 weeks | Client 10+ |

**Do not sell a 50-clinic vision on Path A pricing.** The pricing model in this kit is built for Path A and tells you when to switch.

---

## SEVERITY 2 — Fix before client #1 goes live

### 2.1 Passwords stored in plaintext

`server.js` line 812: `admin.password === password`. Passwords are written to MongoDB as-is. Anyone with database read access — including you, a contractor, or an attacker — sees every clinic admin's password in cleartext. Dentists reuse passwords.

**Fix:** bcrypt (cost 12) or argon2id. Hash on create and on password change; compare with `bcrypt.compare`.

### 2.2 Password comparison is case-insensitive

Same line: `admin.password.toLowerCase() === password.toLowerCase()`.

`Zenora2010!` and `zenora2010!` both authenticate. This collapses the keyspace by roughly 2^n for an n-letter password and silently defeats any password-strength advice you give the clinic.

**Fix:** Delete the `.toLowerCase()` branch. It exists to paper over a case-sensitivity bug; fix the real cause.

### 2.3 Hardcoded default credentials seeded automatically

`server.js` line 315:

```js
await Admin.create({ id: 'ADM0001', email: 'admin@zenoradental.com',
                     password: 'zenoradental2010', role: 'Master Admin' });
```

Every fresh deployment self-seeds a known Master Admin. These credentials are in your source, in your backup zips, and in this repo. If any clinic goes live without changing them, that clinic is owned by anyone who has read your code.

**Fix:** Generate a random password at first boot, print it once to the deploy log, and force a change on first login. Never commit a default credential.

### 2.4 "Login" is a client-side boolean

`ZENORA ADMIN/src/App.tsx` line 209:

```js
return localStorage.getItem('adminLoggedIn') === 'true' || sessionStorage.getItem('adminLoggedIn') === 'true';
```

The server returns a plain user object with no token. The client stores a string. Typing `localStorage.setItem('adminLoggedIn','true')` in the browser console grants full dashboard access — and since the API has no auth either (1.1), the dashboard genuinely works.

**Fix:** Issue a signed JWT on login (short expiry + refresh). Store the role server-side in the token, not in `localStorage`. Never trust a client-held role for Master Admin gating.

### 2.5 CORS fully open

`server.js` line 14: `app.use(cors());` — allows any origin. Combined with 1.1, any website on the internet can read the patient database from a visitor's browser.

**Fix:** `cors({ origin: [clinicDomain, adminDomain], credentials: true })`.

### 2.6 TLS certificate verification disabled

`server.js` lines 41, 57: `rejectUnauthorized: false` on the non-Resend SMTP path. This disables certificate validation and makes SMTP credentials interceptable via MITM.

**Fix:** Remove it. If a specific host has a cert problem, fix that host.

### 2.7 Race condition + enumerable IDs in `generateId()`

`server.js` line 362 reads the most recent appointment and adds 1. Two simultaneous bookings produce the same ID; `appointmentId` is `unique`, so the second booking **throws a 500 at the patient**. IDs are also sequential (`APT0001`, `APT0002`), so combined with the unauthenticated `GET /api/appointments/:id`, a script can walk the entire patient list.

**Fix:** Use a MongoDB atomic counter (`findOneAndUpdate` with `$inc` on a counters doc) for the sequence, and add a random component to the public-facing tracking ID.

### 2.8 No rate limiting

Nothing throttles `POST /api/appointments`. A trivial script fills every slot for the next year, or floods the clinic's inbox via the confirmation-email path. `POST /api/auth/login` is likewise unthrottled — unlimited credential stuffing against plaintext, case-insensitive passwords.

**Fix:** `express-rate-limit`. Strict on login (5/15min/IP), moderate on booking (10/hr/IP), plus a CAPTCHA or honeypot on the public form.

### 2.9 No input validation

No route validates anything. `age` goes through `parseInt` and can be `NaN`; strings have no length limits; emails are never format-checked. `medicalHistory` and `symptoms` are stored raw and rendered into HTML emails — an injection path into whatever mail client the patient uses.

**Fix:** `zod` or `express-validator` on every route. Escape all user content before HTML email interpolation.

---

## SEVERITY 3 — Operational gaps that will cost you support hours

| Gap | Consequence | Fix |
|---|---|---|
| No audit trail | Clinic disputes "who cancelled this appointment?" — you cannot answer | `auditLog` collection: actor, action, entity, before/after, timestamp |
| No error monitoring | You find out the booking form is broken when the clinic phones you angry | Sentry (free tier is enough) |
| No uptime monitoring | Vercel cold starts + Atlas sleep = silent booking outages | UptimeRobot on `/api/settings`, 5-min interval |
| No documented backup/restore | You cannot honour any data-loss promise you make | Atlas continuous backup + a **tested** restore runbook |
| No email delivery logging | "We never got the confirmation" is unfalsifiable | Store Resend message IDs on the appointment; expose in admin |
| Twilio installed but unused | `twilio@^6.0.2` is in `package.json`; there is **zero** Twilio code in `server.js` | **Do not sell SMS or WhatsApp reminders.** Not built. |
| No patient consent capture | DPDP Act requires consent for health data | Consent checkbox + timestamp on booking; store it |
| No appointment reminders | The single highest-ROI feature for a clinic, and it doesn't exist | Cron + email 24h before. Build this first — see roadmap |
| `.env` / `.env.local` on disk | Gitignored, but present in a folder synced by `auto_sync.ps1` and inside `Zenora_Complete_Website_Backup.zip` | Verify the zips. Rotate `MONGODB_URI` and `SMTP_PASS` now if those zips ever left your machine |

---

## What IS genuinely solid

Being straight about the gaps is only useful if I'm equally straight about the strengths. These are real, verified in code, and are what the sales kit sells:

- **Transactional email engine** (`server.js` 129–236, 452–740). Five branded HTML templates: booking confirmed, status updated, doctor assigned, details changed *with a visual before→after diff*, and visit-completed with a Google review CTA. Resend API primary with SMTP dual-port failover (587→465) and forced IPv4 DNS. This is more thought than most agency builds put into email, and it works.
- **Command Center** (`CommandCenter.tsx`). Drag-and-drop patient flow — Waiting Room → Checkup → Treatment → Discharged — filtered to today. Genuinely useful to a front-desk operator, and it demos beautifully. **This is your lead demo.**
- **Double-booking prevention** (`server.js` 418–428). Server-side date+time uniqueness check that correctly excludes cancelled slots.
- **Priority Lead capture** (`server.js` 411). Callback requests bypass the slot check and get flagged in the dashboard with a dedicated filter. Given that ~67% of dental patients still prefer phone, this is the most commercially relevant feature in the build and you should lead with it.
- **Operational kill switches** (`server.js` 940–967). `pauseBookings` is enforced **server-side** with a 403 — not just hidden in the UI. `maintenanceMode` gates admin login for non-Master-Admins. Correctly implemented.
- **Invoice generator** (`InvoiceModal.tsx`). Line items, configurable tax rate, ₹ INR, jsPDF + autotable, instant download. Real and working.
- **Patient self-service status page** (`check-status.html` + tracking IDs). Deflects "has my appointment been confirmed?" phone calls.
- **SEO fundamentals** on the patient site: canonical tags, OG + Twitter cards, and JSON-LD `MedicalProcedure` schema. Most clinic sites in this price bracket have none of this.
- **Modern, current stack**: React 19, TypeScript, Vite 8, Tailwind v4, Radix, Framer Motion, Recharts, Express 5, Mongoose 9. Nothing legacy.

---

## Recommended sequence

**Week 1 — "Safe to demo"** *(do this before your next sales call)*
1. Flag or hide the Analytics tab (1.3)
2. Delete `DELETE /api/appointments` (1.2)
3. Fix the placeholder Google review link (1.4)
4. Move clinic identity — name, phone, email, from-address — into env vars (1.4)

**Week 2 — "Safe to sell"** *(before client #1 pays)*
5. JWT auth middleware on all non-public routes (1.1, 2.4)
6. Public `GET /api/availability` returning times only (1.1)
7. bcrypt passwords; remove `.toLowerCase()`; randomise the seeded admin (2.1, 2.2, 2.3)
8. Lock CORS; remove `rejectUnauthorized: false` (2.5, 2.6)
9. Rate limiting on login + booking (2.8)

**Week 3 — "Safe to scale"**
10. `zod` validation on all routes (2.9)
11. Atomic counter for IDs (2.7)
12. Sentry + UptimeRobot + Atlas backups (Severity 3)
13. Soft deletes + audit log (Severity 3)

**Week 4 — "Worth more money"**
14. **24h automated appointment reminders** — the highest-ROI feature you can add, and the one clinics will actually pay more for
15. Real revenue tracking: `price` on appointments + per-clinic service price table (1.3)
16. Scripted per-clinic deployment (Path A, 1.4)

**At client #8:** start the multi-tenant migration (Path B, 1.4). Don't start it sooner — you'll be building for customers you don't have yet.

---

## Bottom line

You have a genuinely good product with a professional front end, a thoughtful email engine, and a front-desk tool that demos well. What it does not yet have is the boring layer that makes software safe to sell to a healthcare business: authentication, tenancy, and honest reporting.

Roughly **two weeks of focused work** moves this from "impressive portfolio piece" to "defensible commercial product." The sales kit is built to run in parallel — book pilot demos now using the demo script in the playbook, which deliberately routes around the Analytics tab, and close paid contracts as Week 2 lands.

Sell the pilot. Fix the auth. Then scale.
