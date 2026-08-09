# Zenora Dental — Sales Kit

Built 6 August 2026 for WhiteFox AI. Model: license Zenora to many dental clinics, deployed per clinic, setup fee + monthly.

---

## Read in this order

| # | File | What it's for |
|---|---|---|
| **1** | `05_Production_Readiness_Gap_Report.md` | **Read this first.** Three findings change what you're allowed to demo and promise. |
| **2** | `01_Sales_Playbook.md` | Market, ICP, positioning, pricing, outreach scripts, demo script, objection handling, first 30 days. |
| **3** | `02_Zenora_Pitch_Deck.pptx` | 14-slide deck for walking a clinic owner through it. Speaker notes on every slide. |
| **4** | `03_Zenora_One_Pager.pdf` | Print it. Leave it at reception. Attach it to day-7 follow-ups. |
| **5** | `04_Zenora_Sales_Ops.xlsx` | Pipeline CRM, prospect list with auto-scoring, pricing calculator, 12-month revenue model, dashboard. |

---

## The three things that matter most

**1. Do not demo the Analytics tab.**
`AnalyticsDashboard.tsx` line 50 — your own comment reads *"Generate some realistic looking fake revenue data"*. All-Time Revenue, Monthly Revenue, Projected Annual and the Revenue Growth chart come from hardcoded constants, in `$`, not from clinic data. Demoing that as a clinic's real revenue is a refund-and-reputation event. The demo script in the playbook routes around it deliberately — follow it.

**2. Every API endpoint is unauthenticated.**
There is no auth middleware in `server.js` — only `cors`, `express.json`, a DB connector, and static file serving. `GET /api/appointments` returns every patient's name, phone, email, symptoms and medical history to anyone with the URL — and that URL is called from the public booking page, so it's visible in the page source. Also: `DELETE /api/appointments` wipes the database with one unauthenticated request. Close these before a paying clinic goes live.

**3. It's single-tenant.**
No `clinicId` on any model. Clinic #2 needs a whole separate deployment. Pricing in this kit is built for deploy-per-clinic (fine to about 8 clients) and tells you when to switch to multi-tenant.

**Roughly two weeks of focused work closes all three.** Book demos now, close paid contracts as the fixes land.

---

## Before your first call

- [ ] Read the gap report end to end
- [ ] Hide or clearly label the Analytics tab as sample data
- [ ] Fix the placeholder Google review link (`server.js` line 564 — currently `g.page/review/placeholder-link`, and it ships in every visit-completed email)
- [ ] Deploy a clean demo instance with realistic sample data
- [ ] Put your real phone and email into the deck (slide 14), the one-pager footer, and the email templates
- [ ] Build a list of 50 clinics in the Prospect List tab
- [ ] Practise the 15-minute demo once out loud, timed

---

## Every product claim in this kit was verified against source

Nothing in the deck, one-pager or scripts is aspirational. Checks run against the actual files:

| Claim | Verified in |
|---|---|
| 6 booking services | `book-appointment.html` — General Checkup, Cleaning, Whitening, Root Canal, Implants, Orthodontics |
| Patient self-service status page | `check-status.html` |
| Command Center — 4 stages | `CommandCenter.tsx:28` — Waiting Room, Checkup, Treatment, Discharged |
| 8 dashboard sections | `App.tsx` navItems — Dashboard, Command Center, Appointments, Patients, Doctors, Calendar, Analytics, Settings |
| 6 appointment filters | `App.tsx` — all, priority, Pending, Confirmed, Completed, Cancelled |
| 5 automated email templates | `server.js` — 5 × `generateEmailHTML()` |
| Double-booking prevented server-side | `server.js:427` |
| Pause bookings enforced server-side (403) | `server.js:407` |
| Priority Lead bypasses slot check | `server.js:411–418` |
| Invoice generator, tax, INR, PDF | `InvoiceModal.tsx` — jsPDF + autotable |
| CSV export | `App.tsx:787` |
| Browser notifications | `App.tsx:426` |
| JSON-LD schema on site | `service.html` |
| Blog page | `blog.html` |

**And what was deliberately excluded, because it isn't built:**

| Not claimed | Why |
|---|---|
| SMS / WhatsApp reminders | `twilio` is in `package.json` but appears **0 times** in `server.js` |
| Automated appointment reminders | No scheduler, no cron, no reminder code anywhere |
| Real revenue analytics | Hardcoded sample data — `AnalyticsDashboard.tsx:50` |
| Online payments, insurance claims, imaging, multi-location | None of it exists |

If a prospect asks for any of the second list, it is roadmap — not included. Say so.
