# Zenora Dental — Sales Playbook

**Product:** Zenora Dental — patient booking website + clinic admin dashboard
**Vendor:** WhiteFox AI
**Model:** Licensed, deployed per clinic (setup fee + monthly)
**Version:** 1.0 — 6 August 2026

> **Before your first call, read `05_Production_Readiness_Gap_Report.md`.** Three findings there change what you are allowed to demo and promise. The scripts in this playbook already route around them.

---

## 1. The market

| Fact | Number | Why it matters to you |
|---|---|---|
| Dental clinics in India | **65,421** (Apr 2026) | The market is big enough that you never need to win a competitive bake-off |
| Single-owner clinics | **93.26%** | One decision maker. No procurement. No committee. Sell to the dentist directly |
| Registered dentists | **376,721** | Oversupply → competition for patients → they need differentiation |
| Top states | Maharashtra 9,456 · UP 7,979 · TN 5,689 | Start where density is highest |
| Existing software pricing | ₹999–₹3,000/mo typical | Your recurring price must live in this band |
| Website design pricing | ₹15,000–₹1,50,000+ | Your setup fee has room |

**The structural insight:** 93% single-owner means your buyer is the dentist, and the dentist is chair-side all day. Sell in the 30 minutes between their last patient and closing.

---

## 2. Ideal Customer Profile

**Target — go here first:**
- Single-owner clinic, 1–3 chairs, 1–4 dentists
- Urban / tier-1 or tier-2 city
- Has a Google Business Profile with reviews but a bad website, a Practo-only presence, or no site at all
- Front desk is one person, or the dentist's spouse, or nobody
- Books appointments via phone and a paper diary or WhatsApp
- Owner is 28–45 (comfortable with software, still building the practice)

**Strong buying signals:**
- Google listing says "website coming soon" or links to a Facebook page
- Their existing site has no booking form, only a phone number
- They're running Google/Meta ads pointing at a page with no booking capability *(they are paying for clicks they cannot convert — this is your best possible lead)*
- Recently opened, or recently expanded to a second chair
- Actively asks patients for Google reviews *(they already think about growth)*

**Disqualify — do not chase:**
- Multi-location chains (need multi-tenant + integrations you don't have — see gap report)
- Clinics already on Practo Ray / Dentalkart with a working workflow (switching cost too high for round one)
- Anyone who asks about insurance claim processing, DICOM/X-ray imaging, or Tally integration (not built, don't promise)
- Government or hospital-attached departments (procurement will eat you alive)

---

## 3. Positioning

### One-liner
> A booking website and front-desk dashboard built specifically for dental clinics — live in 7 days, for less than one implant case.

### The wedge (this is the important part)

Most agencies sell dentists a *website*. A website is a brochure — the dentist can't measure it, so they resent paying for it.

You are not selling a website. **You are selling the recovery of the patients they are already losing.**

The research is clear and it is worth being precise about it: **67% of dental patients still prefer to book by phone**, and 71% of appointments are booked by phone. Meanwhile roughly **1 in 3 calls to dental offices go unanswered during busy hours**, and practices missing 20–38% of calls lose an estimated **$100,000–$150,000 annually** in potential revenue.

So the pitch is **not** "everyone books online now." That's false, dentists know it's false, and saying it costs you credibility in the first minute.

The pitch is:

> "You're not losing patients because they want to book online. You're losing them because when they call at 8pm — or while you're mid-root-canal — nobody picks up, and they call the next clinic on Google. Zenora catches those patients three ways: they book the slot themselves, or they leave a Priority callback request that lands at the top of your dashboard, or they at minimum land on a site that looks like a clinic worth waiting for."

That is honest, it is specific, and it maps exactly to features that actually exist in your build.

### Positioning against the field

| Competitor | Their pitch | Your counter |
|---|---|---|
| **Practo Ray** (₹2,000+/mo) | Full practice management + patient marketplace | "Practo puts you in a list next to twelve competitors. This is *your* website, *your* brand, *your* patients — nobody else's logo on it." |
| **Local web agency** (₹20k–₹80k one-time) | A pretty brochure site | "They hand you a website and disappear. You get a booking system, a front-desk dashboard, and automated patient emails — and someone who still answers the phone in month six." |
| **Wix / WordPress DIY** (₹500/mo) | Cheap and self-serve | "Who's building it? Your evenings are worth more than ₹1,500 a month. And it still won't have a dashboard your receptionist can run." |
| **Doing nothing** *(your real competitor)* | Free | "It isn't free. Every unanswered call is a patient at the clinic down the road. This costs less per month than one cleaning." |

**Your genuine advantages:** speed (7 days vs 6 weeks), a real admin dashboard (agencies don't build one), automated patient emails (nobody at this price does this well), and the fact that you built it and can change it.

---

## 4. What you are actually selling — verified feature list

Everything below is confirmed present in the code. Nothing here is aspirational.

### Patient-facing website
- 5 main pages: Home, About, Services, Blog, Contact — plus Privacy, Terms, Cookies and a custom 404
- Mobile-first responsive; images served in WebP at 6 breakpoints
- SEO built in: canonical tags, Open Graph, Twitter cards, JSON-LD `MedicalProcedure` schema
- **Online booking**: 6 services (General Checkup, Cleaning, Whitening, Root Canal, Implants, Orthodontics), date + time slot selection
- **Priority callback request** — for patients who'd rather be phoned; bypasses slot selection and flags in the dashboard
- **Patient self-service status page** — unique tracking ID (`APT0001`) lets patients check their own status instead of phoning the clinic

### Clinic admin dashboard
- **Command Center** — drag-and-drop patient flow: Waiting Room → Checkup → Treatment → Discharged, filtered to today *(lead with this in every demo)*
- **Appointments** — filter by All / Priority Leads / Pending / Confirmed / Completed / Cancelled; search by name, ID or phone; date filters (today / week / month); sort by newest, oldest, name
- **Patients** — searchable patient records with history
- **Doctors** — add, edit, remove; availability status (Available / On Leave)
- **Calendar** — month view, colour-coded by status
- **Invoice generator** — line items, configurable tax rate, ₹ INR, one-click branded PDF
- **CSV export** — appointment data to Excel
- **Settings** — Master Admin vs Administrator roles; add/promote/demote/remove staff logins
- **Kill switches** — Pause Bookings (enforced server-side) and Maintenance Mode
- Command palette (Ctrl/Cmd+Space), browser notifications for new bookings, dark mode

### Automated patient emails — 5 branded templates
1. **Booking confirmed** — tracking ID, date, time, service, status-check button
2. **Status updated** — when the clinic confirms or changes an appointment
3. **Doctor assigned** — patient learns who they're seeing
4. **Details changed** — shows a visual before → after diff of date/time/doctor
5. **Visit completed** — thank-you plus a Google review request *(this one quietly pays for the whole subscription)*

### Technical
- Server-side double-booking prevention
- MongoDB Atlas · Express 5 · React 19 · TypeScript · Vite · Tailwind v4
- Deployed on Vercel; custom domain; SSL included

### ⛔ Do NOT promise these — they do not exist
SMS or WhatsApp reminders (Twilio is installed but unused) · automated appointment reminders · payment gateway / online payments · insurance claim processing · X-ray or DICOM imaging · Tally / accounting integration · multi-location support · patient mobile app · **real revenue analytics — the Analytics tab is hardcoded sample data, see gap report §1.3**

---

## 5. Pricing

### Structure: setup fee + monthly. Never monthly-only.

The setup fee covers your real deployment labour and filters out tyre-kickers. The monthly builds the asset you're actually creating.

| | **STARTER** | **PROFESSIONAL** ⭐ | **CLINIC PLUS** |
|---|---|---|---|
| **Setup (one-time)** | ₹24,999 | ₹44,999 | ₹79,999 |
| **Monthly** | ₹1,499 | ₹2,499 | ₹4,499 |
| Website + booking | ✅ | ✅ | ✅ |
| Admin dashboard | ✅ | ✅ | ✅ |
| Automated emails | ✅ | ✅ | ✅ |
| Patient status page | ✅ | ✅ | ✅ |
| Command Center | — | ✅ | ✅ |
| Invoice generator | — | ✅ | ✅ |
| Staff logins | 1 | 3 | Unlimited |
| Doctors | 1 | 5 | Unlimited |
| Custom domain | Client-supplied | ✅ Included yr 1 | ✅ Included |
| Content changes | ₹1,500 each | 2 / month | Unlimited |
| Support | Email, 48h | Email + phone, 24h | Priority, 4h |
| Google review automation | — | ✅ | ✅ |
| Monthly performance report | — | — | ✅ |

**Anchor on PROFESSIONAL.** Starter exists to make Professional look reasonable. Clinic Plus exists to make Professional look safe.

### The framing that closes

Never say "₹44,999." Say:

> "Setup is ₹44,999 — that's roughly **one implant case**. Then ₹2,499 a month, which is about **₹83 a day**. If this brings you **one extra patient a month**, it has paid for itself several times over."

An implant in urban India runs ₹25,000–₹60,000. A single recovered patient covers the year. Make the dentist do that arithmetic in their own head — don't do it for them, ask the question and let them answer.

### Discounts — rules, not vibes
- **Annual prepay:** 2 months free (pay 10, get 12). Push this hard — it fixes your cash flow.
- **Founding client (first 5 only):** 40% off setup **in exchange for a written testimonial + a named case study + 3 referrals.** Never discount for nothing.
- **Referral:** 1 free month to the referrer, ₹5,000 off setup for the referred.
- **Never** discount the monthly. Discount setup instead — protect the recurring revenue.

### Your margin (per Professional client) — be honest with yourself here

There are **two different margins** and it matters that you don't confuse them.

**1. Blended margin on a year-1 contract — this is a services margin, not a SaaS margin.**

| | |
|---|---|
| Revenue (₹44,999 setup + 12 × ₹2,499) | **₹74,987** |
| Build labour (14 hrs × ₹1,500) | ₹21,000 |
| Hosting over 12 months (₹200/mo) | ₹2,400 |
| Support (0.5 hrs/mo × ₹1,500 × 12) | ₹9,000 |
| Domain | ₹1,200 |
| **Gross profit** | **₹41,387** |
| **Blended margin** | **~55%** |
| **Effective hourly rate** | **~₹2,069/hr** |

55% is healthy for a productized service. It is *not* 90%, and anyone telling you a deploy-per-clinic model produces SaaS margins is selling you something.

**2. Subscription margin, once the build is paid for — this is the number that compounds.**

| | |
|---|---|
| Monthly revenue | ₹2,499 |
| Hosting | ₹200 |
| Support (0.5 hrs × ₹1,500) | ₹750 |
| **Monthly gross profit** | **₹1,549** |
| **Subscription margin** | **~62%** |

⚠️ **Two things that quietly destroy this:**

- **Support time.** At 0.5 hrs/month you're at 62%. At 1.5 hrs/month you're at 24%. Support hours are the single biggest lever on your margin — better onboarding and documentation are worth more than a price rise.
- **Infrastructure tiers.** On free tiers a single clinic costs near zero. On paid tiers (Vercel Pro ~₹1,700 + Atlas M10 ~₹500) one clinic alone is close to break-even at ₹2,499. **Put several clinics on one paid instance** and per-clinic hosting drops back to ~₹200.

Model your actual numbers in the Pricing Calculator tab before you sign client #10.

### Revenue targets

| Clients | Setup (one-off) | MRR | ARR |
|---|---|---|---|
| 5 | ₹2,24,995 | ₹12,495 | ₹1,49,940 |
| 10 | ₹4,49,990 | ₹24,990 | ₹2,99,880 |
| 25 | ₹11,24,975 | ₹62,475 | ₹7,49,700 |
| 50 | ₹22,49,950 | ₹1,24,950 | ₹14,99,400 |

At 25 clients you have ~₹7.5L ARR plus setup fees. **That is also the point where deploy-per-clinic ops start to hurt** — see gap report §1.4 and start multi-tenant work at client 8.

---

## 6. Prospecting — building the list

**Where to find them, in order of quality:**

1. **Google Maps** — search "dental clinic [area]". Filter for: 4+ stars, 20+ reviews, **no website link or a bad one**. High reviews + bad website = they're good at dentistry, bad at digital. Perfect.
2. **Meta Ad Library** — search dental clinics in your city. Anyone running ads to a page with no booking form is **burning money on clicks they can't convert**. Lead with that. This is your single best source.
3. **Practo / JustDial** — clinics listed there have already shown willingness to pay for patient acquisition. They just don't own the channel.
4. **Instagram** — dental clinics posting before/afters with "DM to book" in the bio. They already market themselves; they just have no system.
5. **IDA (Indian Dental Association) local branch** events — the highest-trust path, and one warm intro is worth 50 cold emails.

**Qualify before you write:** clinic name, owner's name, phone, email, Google rating + review count, current website (or none), running ads yes/no, chairs, city. Log it in `04_Zenora_Sales_Ops.xlsx`.

**Volume target:** 20 qualified prospects/week → ~4 demos → ~1 close. Adjust once you have real numbers.

---

## 7. Outreach

### 7.1 Cold email — the "wasted ad spend" open (best performer)

> **Subject:** Your Google ad → no booking button
>
> Dr. [Name],
>
> I saw [Clinic Name] running ads on Google this week. I clicked through the way a patient would.
>
> The page has your phone number, but no way to book. So anyone who clicks after 7pm — or while your line is busy — has nothing to do but close the tab and try the next clinic.
>
> I build booking sites for dental clinics. Patients pick a slot themselves, it lands in a dashboard your front desk runs, and they get a confirmation email automatically.
>
> I've set up a live demo you can click through in two minutes: [DEMO URL]
>
> Worth a 15-minute call this week?
>
> WhiteFox AI · [phone]

### 7.2 Cold email — the "missed calls" open

> **Subject:** The calls [Clinic Name] misses after 7pm
>
> Dr. [Name],
>
> Quick question — when a patient calls your clinic at 8:30pm, what happens?
>
> Across dental practices, roughly one in three calls during busy hours go unanswered, and most of those patients simply call the next clinic on Google. They don't call back.
>
> I build booking websites for dental clinics that catch those patients — they either book a slot themselves or leave a callback request that's waiting at the top of your dashboard in the morning.
>
> Live demo, two minutes: [DEMO URL]
>
> Would 15 minutes this week be useful?
> WhiteFox AI · [phone]

### 7.3 Follow-up sequence

**Day 3 — the specific observation**
> Dr. [Name] — following up on my note.
>
> One thing I noticed: you have [X] Google reviews at [Y] stars, which is genuinely strong — better than most clinics in [area]. But your listing points to [a Facebook page / no website], so patients who look you up have nowhere to go.
>
> You've done the hard part. The easy part is missing. Two-minute demo: [DEMO URL]

**Day 7 — the give**
> Dr. [Name] — I put together a one-page breakdown of what patients see when they search for [Clinic Name], and the three places you're losing them. Attached, no strings.
>
> If it's useful, happy to talk. If not, I'll leave you alone.

*(Attach `03_Zenora_One_Pager.pdf`.)*

**Day 14 — the close-out**
> Dr. [Name] — I'll stop here, I know your inbox is busy.
>
> If it's ever useful, the demo stays live: [DEMO URL]
>
> One last thing worth knowing: I only take on a handful of clinics per city, because each one gets a custom build. [Area] is still open.

*Then genuinely stop. Reopen in 90 days.*

### 7.4 WhatsApp / Instagram DM

Shorter, more human, no formatting:

> Hi Dr. [Name] — saw [Clinic Name] on Google, [X] reviews is impressive 👏
>
> Noticed there's no way for patients to book online though. I build booking sites for dental clinics — patients pick a slot, it goes straight to a dashboard, they get an automatic confirmation.
>
> Live demo if you're curious: [DEMO URL]
>
> Worth a quick chat?

### 7.5 Walk-in (highest conversion — do this)

Go at **3–4pm on a weekday** — post-lunch lull, pre-evening rush.

**To the receptionist:**
> "Hi — I'm not a patient. I build booking websites for dental clinics and I'd love to leave something for Dr. [Name]. Is there a good time to catch them for five minutes?"

Leave the printed one-pager. Ask for the best email. Follow up next morning referencing the visit — the visit makes your email a warm one.

**If you get the dentist:**
> "Dr. [Name], two minutes and I'll get out of your way. I build booking websites for dental clinics. Can I show you one thing on my phone?"

Open the **Command Center** and drag a patient card from Waiting Room to Checkup. That's the whole pitch. Then: *"Would something like this be useful here, or is your current system working fine?"*

---

## 8. The demo — follow this order exactly

**Duration: 15 minutes. Screen share or a phone at their desk.**

⚠️ **Do NOT open the Analytics tab.** The revenue figures are hardcoded sample data (gap report §1.3). If they click it themselves, say plainly: *"That's sample data — revenue tracking connects to your real service pricing during setup."* Never present those numbers as theirs.

**Minute 0–2 — Their world, not your product**
> "Before I show you anything — how do patients book with you today? … And who handles the phone when you're with a patient?"

Let them talk. Write down the words they use. You will repeat those words back later.

**Minute 2–5 — The patient's view**
Open the live site on your phone. Book an appointment as a patient, out loud, in front of them.
> "So — patient searches, lands here, picks Root Canal, picks Thursday 11am, submits. Done. Fifteen seconds, 9pm, you were asleep."

Then show the confirmation email arriving.
> "That went out automatically. Nobody at your clinic did anything."

**Minute 5–9 — Their view (the money moment)**
Switch to the dashboard. The booking you just made is sitting there.
> "That's the appointment you just watched get made."

Then go straight to **Command Center** and drag a card across.
> "This is today's patient flow. Waiting Room, Checkup, Treatment, Discharged. Your receptionist drags a card. Anyone can see where every patient is without shouting across the clinic."

**This is the moment they buy.** Slow down here. Let them ask for the mouse.

**Minute 9–12 — The two features that pay for it**
1. **Priority Leads filter:** *"Patients who'd rather be called back land here, flagged. Your receptionist works this list first thing in the morning. These are the patients you're currently losing."*
2. **Visit-completed email:** *"When you mark a patient Completed, they automatically get a thank-you with a Google review link. You said reviews matter — this runs on its own, forever."*

**Minute 12–15 — Price and close**
> "Setup is ₹44,999 — about one implant case. Then ₹2,499 a month, roughly ₹83 a day.
>
> Let me ask you honestly: if this brought you **one extra patient a month**, would that be worth ₹83 a day?"

Then **stop talking.** Whoever speaks first, loses. Let the silence do the work.

---

## 9. Objection handling

**"It's too expensive."**
> "Compared to what, out of interest? … A one-time agency site is ₹20,000 to ₹80,000 and you get a brochure, then they disappear. This is a booking system, a dashboard, automated patient emails, and someone who still picks up in month six. But let me ask — is it the setup fee or the monthly that's the concern?"
>
> *(Setup → offer to split across 2 months. Monthly → annual prepay, 2 months free.)*

**"I already have a website."**
> "You do — I looked at it. Can patients book on it? … Right. So it tells people you exist, but it can't take a booking. That's the gap. I can keep your existing site and just add the booking layer if you'd rather."

**"We're doing fine with phone bookings."**
> "I believe you — most clinics are, during hours. What happens to the calls that come in while you're mid-procedure, or after you close? … Across the industry about a third of calls during busy hours go unanswered, and those patients call the next clinic rather than call back. You're not losing the patients you talk to. You're losing the ones you never hear."

**"My receptionist won't be able to use it."**
> "Fair concern. Can I show you the actual thing she'd use?" *(Open Command Center, drag a card.)* "That's it. That's the training. I'll also do a live session with her and stay on WhatsApp for the first month."

**"Send me the details and I'll think about it."**
> "Happy to. Just so I send the right thing — is it the price, or whether your team will use it? … Let's do this: I'll send it over, and I'll call Thursday at 4pm. If it's a no by then, tell me and I'll stop. Fair?"
>
> *Always leave with a specific time. "I'll follow up" is where deals die.*

**"Can you do it cheaper?"**
> "I can't move the price, but I can move what's included. Which matters more to you — the setup cost, or the monthly?" *(Then trade: annual prepay, or Starter tier, or founding-client rate in exchange for a testimonial and three referrals. Never discount for free.)*

**"How do I know you won't disappear?"**
> "Reasonable question — plenty of people do. Here's what I'll put in writing: you own the domain, the content is exported and handed to you on request, and if you ever leave I'll transfer everything. You're not hostage to me. Also, I'm local — you can walk into my office."

**"Is my patients' data safe?"** *(Answer this honestly. Do not oversell it.)*
> "Data sits in MongoDB Atlas — encrypted, backed up, same infrastructure large healthcare apps use. Access is restricted to logins you control, and you can revoke any staff login instantly. I'm also happy to put data handling in the contract."
>
> ⚠️ **This answer becomes fully true only after gap report §1.1 and §2.1 are fixed. Close those first, or answer with "here's exactly what we're hardening this month" — never with a claim you can't back.**

**"Can I get SMS/WhatsApp reminders?"**
> "Not today — that's on the roadmap for [quarter]. What's built and working is email automation: confirmation, status changes, and a post-visit review request."
>
> *Never promise this as included. It isn't built.*

---

## 10. Closing

**The assumptive close:**
> "So — do you want to start with Professional, or would Clinic Plus fit better with the second chair coming?"

**The pilot close (best for hesitant buyers):**
> "Let's take the risk off the table. I'll build it and put it live. Use it for 30 days. If it hasn't brought you a single patient, don't pay the setup fee — just cover the ₹2,499. I'll take that bet because I've seen what happens when clinics turn this on."

**The scarcity close (only if true — never fake it):**
> "I take a limited number of clinics per area because each build is custom. [Area] is open now. I can't promise it will be in six weeks."

### After they say yes — same day
1. Send the invoice with a payment link
2. Send an onboarding form: logo, clinic photos, doctor bios, services + prices, hours, Google review link, domain preference
3. Book a 30-minute kickoff call
4. **Commit to a live date and hit it.** Your first testimonial is built here.

---

## 11. First 30 days

| Week | Focus | Target |
|---|---|---|
| **1** | Close gap report Week 1 + 2 items. Deploy a clean demo instance with realistic sample data. Build a 50-clinic list. | Demo safe to show |
| **2** | 25 cold emails + 10 walk-ins. Book demos. | 5 demos booked |
| **3** | Run demos. Founding-client offer (40% off setup for testimonial + case study + 3 referrals). | 2 clients closed |
| **4** | Deliver both builds in 7 days. Collect testimonials + before/after screenshots. | 2 live sites, 2 testimonials |

**Month 2 onward:** every new client owes you 3 referrals as part of onboarding. Referral is the only channel that compounds.

---

## 12. Metrics to track

| Metric | Healthy | Where |
|---|---|---|
| Cold email → reply | 8–15% | Pipeline tab |
| Reply → demo booked | 40% | Pipeline tab |
| Demo → close | 25–35% | Pipeline tab |
| Avg. deal (setup + 12mo) | ₹75,000 | Pipeline tab |
| Time to live | ≤ 7 days | Pipeline tab |
| Churn | < 5%/mo | Revenue tab |
| Referrals per client | ≥ 1 | Pipeline tab |

If demo → close is below 20%, the problem is your qualification, not your demo. Go back to §2 and disqualify harder.

---

## Sources

- [Dental clinics in India — count, ownership split, state breakdown](https://rentechdigital.com/smartscraper/business-report-details/list-of-dental-clinics-in-india)
- [Registered dentists in India — DCI](https://dciindia.gov.in/DentistRegistered.aspx)
- [Dentistry in India: oversupply and workforce trends — ORF](https://www.orfonline.org/expert-speak/dentistry-in-india-oversupply-and-gender-bias-shaping-oral-health-workforce)
- [Dental practice management software pricing India 2026](https://www.adrine.in/blog/best-dental-practice-management-software-india)
- [Clinic management system cost India 2026](https://ichelonconsulting.com/clinic-management-system-cost-india-2026)
- [Dentist website design cost India 2026](https://codingclave.com/guides/dentist-website-design-india-2026)
- [Dental practice phone statistics 2026 — booking preference and missed calls](https://agentzap.ai/blog/dental-practice-phone-statistics)
- [Missed calls in dental practices — revenue impact](https://www.resonateapp.com/resources/missed-calls-dental-practices-statistics)
