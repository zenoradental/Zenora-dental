# Deploying a Clinic

One clinic gets one Vercel backend project, one MongoDB database, and one copy of the
static site. Nothing clinic-specific is hardcoded — it all comes from environment
variables listed below.

This is **deploy-per-clinic**, not multi-tenant. See
[When to build multi-tenancy](#when-to-build-multi-tenancy) at the bottom.

---

## 1. Environment variables

### Backend (Vercel project: the API)

**Required. The backend is broken or insecure without these.**

| Variable | Purpose | Example |
|---|---|---|
| `MONGODB_URI` | Atlas connection string for **this clinic's** database | `mongodb+srv://user:pass@cluster.mongodb.net/zenora_smilecare` |
| `JWT_SECRET` | Signs admin session tokens. **Unique per clinic.** Rotating it logs everyone out. | 64 hex chars — see below |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist. Anything not listed is refused. | `https://smilecare.example.in,https://www.smilecare.example.in` |
| `FRONTEND_URL` | Public site root. Used to build the "Check status" link in emails. | `https://smilecare.example.in` |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Clinic identity.** Everything the patient sees in an email.

| Variable | Purpose | Notes |
|---|---|---|
| `CLINIC_NAME` | Brand name in email headers, subjects, footer | Defaults to `Zenora Dental` |
| `CLINIC_PHONE` | Phone in the email contact block | Block is omitted if this and `CLINIC_EMAIL` are both unset |
| `CLINIC_EMAIL` | Reply-to address shown in the email contact block | |
| `CLINIC_FROM_ADDRESS` | Envelope sender for outbound mail | Must be on a domain verified with your mail provider |
| `CLINIC_REVIEW_URL` | Google review link in the "visit completed" email | **If unset, the review paragraph and button are omitted entirely.** Never set this to a placeholder. |
| `CLINIC_ID` | Namespaces the service price list | Defaults to `default`; leave alone for single-clinic deploys |

**Email delivery.**

| Variable | Purpose |
|---|---|
| `SMTP_USER` | `resend` to use the Resend HTTP API, otherwise the SMTP username |
| `SMTP_PASS` | Resend API key, or the SMTP password |
| `SMTP_HOST` | SMTP host. Ignored when `SMTP_USER=resend`. |
| `SMTP_FROM_EMAIL` | Fallback sender if `CLINIC_FROM_ADDRESS` is unset |
| `EMAIL_ASSET_BASE_URL` | Base URL for email icon images. Override for white-labelling. |

**Optional.**

| Variable | Default | Purpose |
|---|---|---|
| `SENTRY_DSN` | *(off)* | Backend error reporting. Inert when unset. |
| `SEED_ADMIN_EMAIL` | `admin@zenoradental.com` | Email for the Master Admin created on an empty database |
| `LOGIN_RATE_LIMIT` | `5` | Login attempts per IP per 15 minutes |
| `BOOKING_RATE_LIMIT` | `10` | Bookings per IP per hour |
| `INBOUND_WEBHOOK_SECRET` | *(off)* | Shared secret for `POST /api/inbound`. **Set this** — the route is otherwise open. |

### Admin dashboard (Vercel project: the React app)

Vite inlines these at **build time**, so changing one requires a redeploy, not just a restart.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `https://zenora-backend-black.vercel.app` | Backend origin. **Set this per clinic.** |
| `VITE_ANALYTICS_DEMO_MODE` | `true` | While `true`, the Analytics tab shows a `SAMPLE DATA — NOT YOUR REVENUE` banner. Set to `false` only once the database holds real patient records. |
| `VITE_SENTRY_DSN` | *(off)* | Frontend error reporting |
| `VITE_SENTRY_ENVIRONMENT` | build mode | Sentry environment label |

> Anything prefixed `VITE_` is **compiled into the JavaScript bundle and publicly
> readable**. Never put a secret behind that prefix.

---

## 2. MongoDB Atlas

1. Create a database per clinic in your cluster — e.g. `zenora_smilecare`. Do not
   share a database between clinics; there is no `clinicId` on patient records, so
   two clinics in one database would see each other's patients.
2. Create a database user scoped to that database only (`readWrite` on it, nothing else).
3. Network access: add Vercel's egress. If you are not on a static-IP plan this
   means `0.0.0.0/0`, in which case the database user password is your only
   protection — make it long and unique.
4. Enable **continuous backup** (see [Backups](#4-backups-and-restore)).

### Indexes

Mongoose creates the indexes declared in the schemas on first connect. Confirm after
the first deploy:

```
appointments:    appointmentId (unique)
admins:          id (unique), email (unique)
doctors:         id (unique)
serviceprices:   { clinicId, serviceName } (unique)
auditlogs:       timestamp
```

---

## 3. Deploy

### Backend

1. New Vercel project pointed at `backend/`.
2. Set every required variable above.
3. Deploy.
4. **Read the build logs.** On an empty database the server prints a generated
   Master Admin password inside a `SAVE THIS NOW — SHOWN ONLY ONCE` banner. It is
   stored only as a bcrypt hash and cannot be recovered afterwards. If you miss it,
   drop the `admins` collection and redeploy to generate a new one.
5. Confirm the API is locked down:

   ```bash
   curl -i https://<backend>/api/appointments
   ```

   Must return `401 {"error":"Authentication required"}`. **If it returns patient
   records, stop and do not hand out the URL.**

6. Confirm the public availability endpoint works and leaks nothing:

   ```bash
   curl -s "https://<backend>/api/availability?date=2026-08-10"
   ```

   Must return only `{"booked":[...]}`.

### Migrating an existing database

Run once, from `backend/`, with `MONGODB_URI` pointing at the clinic's database:

```bash
node migrate-passwords.js
```

This bcrypt-hashes any admin password still stored in cleartext. It is idempotent —
a second run reports 0 migrated. **Passwords become case-sensitive afterwards**;
anyone who was signing in with the wrong casing must use the exact password.

### Admin dashboard

1. New Vercel project pointed at `ZENORA ADMIN/`.
2. Set `VITE_API_BASE_URL` to the backend origin.
3. Leave `VITE_ANALYTICS_DEMO_MODE=true` until the clinic's real data is in.
4. Deploy, then add the dashboard's own origin to the backend's `ALLOWED_ORIGINS`
   and redeploy the backend.

### Static site

Deploy `ZEMORA DENTAL/` as its own Vercel project. Then, in the HTML:

- `<link rel="canonical">` and `og:url` on every page must point at the clinic's
  live host. They currently point at `https://zenoradental.whitefoxofficial.space`.
- The phone number is currently the demo placeholder `+91 90000 00000`, appearing in
  the footer of every page, the Emergency Contact block and `tel:` links on
  `index.html`, and `contact.html`. Replace all of them.
- The JSON-LD `PostalAddress` on `index.html` and `contact.html` is a demo
  placeholder (`Bengaluru, KA 560001`). Replace with the real address before launch —
  search engines read it.
- Footer social links are `#` placeholders.

A build-time token substitution over these values is the obvious next step once you
are running more than two or three clinics.

### First login

1. Sign in with `SEED_ADMIN_EMAIL` and the password from the build logs.
2. You are forced onto a change-password screen — there is no way past it. Minimum
   12 characters.
3. Add service prices under **Settings → Service Prices**. Until a service has a
   price, completing an appointment for it records no revenue and the Analytics tab
   shows an empty state rather than a made-up number.

---

## 4. Backups and restore

### Enable continuous backup

MongoDB Atlas → cluster → **Backup** → enable **Continuous Cloud Backup**.

- Requires M10 or above. **Shared tiers (M0/M2/M5) have no point-in-time restore** —
  if you are on a shared tier, you have no real backup and a bad `deleteMany` is
  unrecoverable.
- Retention: 7 days of point-in-time recovery is the practical minimum. 30 days is
  better; patient-record mistakes are often noticed weeks later.
- Snapshot schedule: daily, retained 7 days; weekly, retained 4 weeks.

### Test the restore — before you need it

An untested backup is not a backup. Do this once per clinic at setup, then quarterly:

1. Atlas → **Backup** → **Restore** → pick a point in time ~1 hour ago.
2. Restore to a **new** cluster or a new database name. **Never restore over the
   live database as a test.**
3. Connect to the restored copy and verify:

   ```bash
   mongosh "<restored-uri>" --eval '
     db.appointments.countDocuments({deletedAt: null});
     db.admins.countDocuments();
     db.appointments.find().sort({createdAt:-1}).limit(1).toArray();
   '
   ```

4. Confirm the newest appointment is the one you expect for that point in time.
5. Write down the wall-clock time the whole restore took. That number is your real
   RTO — quote it to the clinic, not an optimistic guess.
6. Delete the restored cluster so you are not billed for it.

### Recovering deleted appointments

Deletes are soft. `DELETE /api/appointments/:id` and `DELETE /api/patients/:id` set
`deletedAt` and the document stays put, so ordinary "oops" recovery needs no backup:

```js
// Restore one appointment
db.appointments.updateOne({ appointmentId: "APT1042K7XQ" }, { $set: { deletedAt: null } })

// Restore everything soft-deleted in the last 24 hours
db.appointments.updateMany(
  { deletedAt: { $gte: new Date(Date.now() - 86400000) } },
  { $set: { deletedAt: null } }
)
```

The audit log records who deleted what and when:

```js
db.auditlogs.find({ action: /delete/ }).sort({ timestamp: -1 }).limit(20)
```

Or via the API, as a Master Admin: `GET /api/audit-log?limit=200`.

---

## 5. Monitoring

- **Sentry** — set `SENTRY_DSN` (backend) and `VITE_SENTRY_DSN` (admin). Both are
  configured with `sendDefaultPii: false` and strip request bodies, cookies and
  `Authorization` headers, so patient data does not leave with a crash report.
- **Uptime** — point an external monitor at `GET /api/availability?date=2026-01-01`.
  It is public, cheap, and touches the database, so it fails when Mongo is down.
- **Audit log** — `GET /api/audit-log` (Master Admin) covers status changes, doctor
  assignments, edits, deletes and price changes.

### Known limitation: rate limiting on serverless

`express-rate-limit` uses an in-memory store, which on Vercel is **per function
instance and reset by every cold start**. It stops casual scripted abuse but is not
a hard guarantee — a distributed attempt across cold starts gets more than 5 login
attempts per 15 minutes.

For a real guarantee, move the store to Redis (Upstash works on Vercel):

```js
const { RedisStore } = require('rate-limit-redis');
// ...pass `store: new RedisStore({ sendCommand: (...args) => redis.call(...args) })`
// to both rate limiters in server.js.
```

---

## 6. Pre-launch checklist

Security:

- [ ] `curl https://<backend>/api/appointments` returns **401**
- [ ] `curl "https://<backend>/api/availability?date=YYYY-MM-DD"` returns only `{"booked":[...]}`
- [ ] `ALLOWED_ORIGINS` lists only this clinic's real origins — no `*`, no leftover hosts
- [ ] `JWT_SECRET` is unique to this clinic and not committed anywhere
- [ ] `node migrate-passwords.js` has been run, if the database predates bcrypt
- [ ] The seeded Master Admin password has been changed
- [ ] `INBOUND_WEBHOOK_SECRET` is set, or `POST /api/inbound` is otherwise blocked

Data:

- [ ] Atlas continuous backup is on, and a restore has actually been performed and timed
- [ ] This clinic has its **own** database, not one shared with another clinic
- [ ] No demo or test appointments remain (`node reset-demo.js --hard`, or clear them)

Content:

- [ ] Real phone number everywhere the demo `+91 90000 00000` appears
- [ ] Real postal address in the JSON-LD
- [ ] Canonical / `og:url` point at this clinic's host
- [ ] `CLINIC_REVIEW_URL` is a working Google review link, or is left unset
- [ ] A test booking arrives, and the confirmation email shows the right clinic name,
      phone and status link

Analytics:

- [ ] Service prices are entered for every service the clinic actually offers
- [ ] `VITE_ANALYTICS_DEMO_MODE=false`, and the admin app has been **rebuilt**
- [ ] The Analytics tab shows real figures in ₹, or an honest empty state

---

## When to build multi-tenancy

Deploy-per-clinic is the right shape while the number of clinics is small. It gives
hard data isolation for free — separate databases mean one clinic physically cannot
read another's patients — and that is worth a lot for medical records.

The cost is linear: every clinic is another Vercel project, another database, another
set of environment variables, and another deploy every time the code changes.

**Around client #8 this stops being worth it.** That is the point where:

- deploying a fix to eight projects is a routine that gets skipped, and instances
  drift apart
- eight sets of environment variables cannot be kept consistent by hand
- Atlas costs are dominated by per-cluster overhead rather than actual data
- a shared admin login across clinics starts being asked for

What multi-tenancy requires when you get there:

1. `clinicId` on `Appointment`, `Doctor`, `Admin` and `Setting`, indexed, with every
   query filtered by it. `Setting` stops being a singleton — `Setting.findOne()` with
   no filter becomes a bug the moment a second clinic shares the database.
2. `clinicId` inside the JWT, and a middleware that scopes every query to
   `req.user.clinicId`. This is the whole security model — one missed filter is a
   cross-clinic patient data leak.
3. A backfill migration stamping existing records with a `clinicId`.
4. Tenant resolution for the public booking endpoints, which carry no JWT — subdomain
   or an explicit clinic slug in the path.
5. Per-tenant rate limiting, so one clinic's traffic cannot exhaust another's budget.

Do not start this piecemeal. A half-migrated schema, where some queries filter by
`clinicId` and some do not, is worse than either end state.
