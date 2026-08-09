const pptxgen = require("pptxgenjs");

const DEEP  = "0A2E36";  // deep teal-charcoal (dark slides)
const TEAL  = "028090";  // primary
const MINT  = "02C39A";  // accent
const LIGHT = "F4F8F8";  // off-white bg
const CARD  = "E8F2F2";  // card tint
const WARN  = "C25A42";  // terracotta (loss/pain)
const INK   = "13343B";  // body text on light
const MUTE  = "5A7B82";  // muted text

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";           // 13.3 x 7.5
pres.author = "WhiteFox AI";
pres.company = "WhiteFox AI";
pres.title = "Zenora Dental";

const H = "Cambria";   // header serif (safe list)
const B = "Calibri";   // body sans (safe list)

// ---------- helpers ----------
function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: DEEP };
  return s;
}
function lightSlide(kicker, title, titleColor) {
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  if (kicker) {
    s.addText(kicker.toUpperCase(), {
      x: 0.7, y: 0.42, w: 11.9, h: 0.28, margin: 0,
      fontFace: B, fontSize: 11, bold: true, color: TEAL, charSpacing: 2.2
    });
  }
  s.addText(title, {
    x: 0.7, y: 0.75, w: 11.9, h: 0.85, margin: 0,
    fontFace: H, fontSize: 34, bold: true, color: titleColor || INK
  });
  return s;
}
function circleIcon(s, x, y, glyph, fill, glyphColor, d) {
  const dia = d || 0.52;
  s.addShape(pres.ShapeType.ellipse, {
    x: x, y: y, w: dia, h: dia, fill: { color: fill }
  });
  s.addText(glyph, {
    x: x, y: y, w: dia, h: dia, margin: 0,
    fontFace: B, fontSize: 15, bold: true, color: glyphColor || "FFFFFF",
    align: "center", valign: "middle"
  });
}
function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, {
    x: x, y: y, w: w, h: h, rectRadius: 0.12,
    fill: { color: fill || "FFFFFF" },
    shadow: { type: "outer", color: "0A2E36", opacity: 0.10, blur: 10, offset: 2, angle: 90 }
  });
}

// ============================================================
// 1 — TITLE
// ============================================================
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.ellipse, { x: 9.9, y: -1.5, w: 5.4, h: 5.4, fill: { color: TEAL }, transparency: 78 });
  s.addShape(pres.ShapeType.ellipse, { x: 11.4, y: 4.6, w: 3.2, h: 3.2, fill: { color: MINT }, transparency: 84 });

  s.addText("WHITEFOX AI", {
    x: 0.85, y: 0.75, w: 6, h: 0.3, margin: 0,
    fontFace: B, fontSize: 11, bold: true, color: MINT, charSpacing: 3
  });
  s.addText("Zenora Dental", {
    x: 0.85, y: 2.15, w: 8.6, h: 1.15, margin: 0,
    fontFace: H, fontSize: 58, bold: true, color: "FFFFFF"
  });
  s.addText("A booking website and front-desk dashboard\nbuilt for dental clinics.", {
    x: 0.85, y: 3.42, w: 8.2, h: 1.0, margin: 0,
    fontFace: B, fontSize: 19, color: "C9E4E4", lineSpacing: 28
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: 0.85, y: 4.75, w: 3.55, h: 0.62, rectRadius: 0.1, fill: { color: MINT }
  });
  s.addText("Live in 7 days", {
    x: 0.85, y: 4.75, w: 3.55, h: 0.62, margin: 0,
    fontFace: B, fontSize: 15, bold: true, color: DEEP, align: "center", valign: "middle"
  });
  s.addText("Prepared for  ·  Dr. [Clinic Owner Name],  [Clinic Name]", {
    x: 0.85, y: 6.35, w: 9, h: 0.32, margin: 0,
    fontFace: B, fontSize: 13, color: "7FA8AC"
  });
  s.addNotes("Open here. Do not read the slide. Say: 'Two minutes, then I'll ask you a question.' Keep this slide up for under 20 seconds.");
}

// ============================================================
// 2 — THE MARKET
// ============================================================
{
  const s = lightSlide("The market", "65,421 dental clinics in India.\nAlmost all of them are one dentist.");

  const stats = [
    ["65,421", "Dental clinics in India\nas of April 2026"],
    ["93.3%", "Are single-owner —\nyou are the decision maker"],
    ["376,721", "Registered dentists —\ncompetition is rising"]
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 2.35, 3.75, 2.0);
    s.addText(st[0], {
      x: x + 0.3, y: 2.6, w: 3.15, h: 0.85, margin: 0,
      fontFace: H, fontSize: 40, bold: true, color: TEAL
    });
    s.addText(st[1], {
      x: x + 0.3, y: 3.48, w: 3.15, h: 0.72, margin: 0,
      fontFace: B, fontSize: 13, color: MUTE, lineSpacing: 17
    });
  });

  card(s, 0.7, 4.72, 11.9, 1.5, DEEP);
  s.addText("More dentists than ever are competing for the same patients. The clinics that win are not the ones with better dentistry — they are the ones a patient can actually reach at 9pm.", {
    x: 1.1, y: 4.95, w: 11.1, h: 1.0, margin: 0,
    fontFace: B, fontSize: 16, italic: true, color: "C9E4E4", lineSpacing: 24
  });
  s.addText("Sources: Rentech Digital clinic census (Apr 2026) · Dental Council of India", {
    x: 0.7, y: 6.55, w: 11.9, h: 0.3, margin: 0,
    fontFace: B, fontSize: 9.5, color: MUTE
  });
  s.addNotes("Point of this slide: they have no procurement, no committee. And competition is genuinely rising. Don't linger — 45 seconds.");
}

// ============================================================
// 3 — THE PROBLEM
// ============================================================
{
  const s = darkSlide();
  s.addText("THE PROBLEM", {
    x: 0.7, y: 0.55, w: 11.9, h: 0.3, margin: 0,
    fontFace: B, fontSize: 11, bold: true, color: MINT, charSpacing: 2.2
  });
  s.addText("You are not losing patients\nbecause your dentistry is worse.", {
    x: 0.7, y: 1.05, w: 8.4, h: 1.3, margin: 0,
    fontFace: H, fontSize: 33, bold: true, color: "FFFFFF"
  });

  s.addText("1 in 3", {
    x: 0.7, y: 2.75, w: 4.2, h: 1.5, margin: 0,
    fontFace: H, fontSize: 78, bold: true, color: WARN
  });
  s.addText("calls to a dental clinic go unanswered\nduring busy hours.", {
    x: 0.7, y: 4.2, w: 5.2, h: 0.8, margin: 0,
    fontFace: B, fontSize: 16, color: "C9E4E4", lineSpacing: 22
  });
  s.addText("Those patients do not call back.\nThey call the next clinic on Google.", {
    x: 0.7, y: 5.2, w: 5.6, h: 0.8, margin: 0,
    fontFace: B, fontSize: 16, bold: true, italic: true, color: MINT, lineSpacing: 22
  });

  const facts = [
    ["71%", "of dental appointments are still booked by phone"],
    ["₹100k–150k", "lost annually (USD) by practices missing 20–38% of calls"],
    ["80%", "of missed calls are someone trying to book"]
  ];
  facts.forEach((f, i) => {
    const y = 2.75 + i * 1.22;
    s.addShape(pres.ShapeType.roundRect, {
      x: 6.65, y: y, w: 5.95, h: 1.02, rectRadius: 0.1, fill: { color: "12414A" }
    });
    s.addText(f[0], {
      x: 6.95, y: y + 0.13, w: 2.15, h: 0.42, margin: 0,
      fontFace: H, fontSize: 21, bold: true, color: MINT
    });
    s.addText(f[1], {
      x: 6.95, y: y + 0.55, w: 5.4, h: 0.4, margin: 0,
      fontFace: B, fontSize: 12, color: "9FC4C7"
    });
  });
  s.addText("Sources: AgentZap dental phone statistics 2026 · Resonate missed-call research", {
    x: 0.7, y: 6.72, w: 11.9, h: 0.28, margin: 0,
    fontFace: B, fontSize: 9.5, color: "5A7B82"
  });
  s.addNotes("THE key slide. Ask before advancing: 'When a patient calls you at 8:30pm, what happens?' Then wait. Let them answer. Their answer is the sale.");
}

// ============================================================
// 4 — THE HONEST NUANCE
// ============================================================
{
  const s = lightSlide("Let's be accurate", "Most patients still prefer the phone.\nThat is exactly the point.");

  card(s, 0.7, 2.35, 5.7, 2.35);
  s.addText("67%", {
    x: 1.05, y: 2.6, w: 2.4, h: 0.72, margin: 0,
    fontFace: H, fontSize: 42, bold: true, color: INK
  });
  s.addText("of dental patients prefer to book by phone.", {
    x: 1.05, y: 3.35, w: 5.0, h: 0.42, margin: 0,
    fontFace: B, fontSize: 14, bold: true, color: INK
  });
  s.addText("So we are not going to tell you that everybody books online now. They don't, and you know they don't.", {
    x: 1.05, y: 3.85, w: 5.0, h: 0.7, margin: 0,
    fontFace: B, fontSize: 13, color: MUTE, lineSpacing: 18
  });

  card(s, 6.9, 2.35, 5.7, 2.35, DEEP);
  s.addText("The gap", {
    x: 7.25, y: 2.6, w: 4.4, h: 0.4, margin: 0,
    fontFace: H, fontSize: 22, bold: true, color: MINT
  });
  s.addText("They want to phone you. They just can't reach you — because you are with a patient, or it is 9pm, or the line is busy.\n\nZenora catches that patient instead of losing them.", {
    x: 7.25, y: 3.1, w: 5.0, h: 1.4, margin: 0,
    fontFace: B, fontSize: 13.5, color: "C9E4E4", lineSpacing: 19
  });

  s.addText("Three ways a patient who can't reach you is captured:", {
    x: 0.7, y: 5.0, w: 11.9, h: 0.35, margin: 0,
    fontFace: B, fontSize: 14, bold: true, color: INK
  });
  const ways = [
    ["1", "They book a slot themselves", "Instantly, without speaking to anyone"],
    ["2", "They request a callback", "Flagged as a Priority Lead in your dashboard"],
    ["3", "They see a real clinic", "A site that looks worth waiting for"]
  ];
  ways.forEach((w, i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 5.45, 3.75, 1.05, CARD);
    circleIcon(s, x + 0.25, 5.72, w[0], TEAL, "FFFFFF", 0.45);
    s.addText(w[1], {
      x: x + 0.82, y: 5.62, w: 2.8, h: 0.3, margin: 0,
      fontFace: B, fontSize: 12.5, bold: true, color: INK
    });
    s.addText(w[2], {
      x: x + 0.82, y: 5.92, w: 2.8, h: 0.45, margin: 0,
      fontFace: B, fontSize: 10.5, color: MUTE, lineSpacing: 13
    });
  });
  s.addNotes("This slide buys you credibility. Dentists have been lied to by agencies. Saying 'most patients prefer the phone' out loud is disarming — and it sets up Priority Leads as the hero feature.");
}

// ============================================================
// 5 — WHAT IT IS
// ============================================================
{
  const s = lightSlide("The product", "Two things, working together.");

  card(s, 0.7, 2.2, 5.75, 3.55);
  circleIcon(s, 1.05, 2.5, "P", MINT, DEEP, 0.5);
  s.addText("For your patients", {
    x: 1.7, y: 2.53, w: 4.4, h: 0.4, margin: 0,
    fontFace: H, fontSize: 21, bold: true, color: INK
  });
  s.addText([
    { text: "A fast, mobile-first clinic website", options: { bullet: true, breakLine: true } },
    { text: "Book a slot in 15 seconds — 6 services, date and time", options: { bullet: true, breakLine: true } },
    { text: "Request a callback instead, if they'd rather talk", options: { bullet: true, breakLine: true } },
    { text: "Automatic confirmation email with a tracking ID", options: { bullet: true, breakLine: true } },
    { text: "Check their own appointment status — without phoning you", options: { bullet: true } }
  ], {
    x: 1.05, y: 3.15, w: 5.1, h: 2.4, margin: 0,
    fontFace: B, fontSize: 13, color: INK, paraSpaceAfter: 9, lineSpacing: 17
  });

  card(s, 6.85, 2.2, 5.75, 3.55, DEEP);
  circleIcon(s, 7.2, 2.5, "C", MINT, DEEP, 0.5);
  s.addText("For your front desk", {
    x: 7.85, y: 2.53, w: 4.4, h: 0.4, margin: 0,
    fontFace: H, fontSize: 21, bold: true, color: "FFFFFF"
  });
  s.addText([
    { text: "Every booking lands in one dashboard", options: { bullet: true, breakLine: true } },
    { text: "Command Center — drag patients through today's flow", options: { bullet: true, breakLine: true } },
    { text: "Priority callback requests, flagged and filtered", options: { bullet: true, breakLine: true } },
    { text: "Assign doctors, generate invoices, export to Excel", options: { bullet: true, breakLine: true } },
    { text: "Pause bookings the moment you need to", options: { bullet: true } }
  ], {
    x: 7.2, y: 3.15, w: 5.1, h: 2.4, margin: 0,
    fontFace: B, fontSize: 13, color: "C9E4E4", paraSpaceAfter: 9, lineSpacing: 17
  });

  s.addText("No app to install. No training day. Your receptionist opens a browser.", {
    x: 0.7, y: 6.05, w: 11.9, h: 0.4, margin: 0,
    fontFace: B, fontSize: 15, italic: true, color: TEAL, align: "center"
  });
  s.addNotes("Keep this short — 40 seconds. The demo does the real work. Do not read the bullets aloud.");
}

// ============================================================
// 6 — PATIENT JOURNEY
// ============================================================
{
  const s = lightSlide("How it works", "A patient at 9pm, start to finish.");

  const steps = [
    ["9:04pm", "Patient searches", "\"dentist near me\" — lands on your site instead of a directory listing"],
    ["9:05pm", "Books the slot", "Picks Root Canal, Thursday 11am. Fifteen seconds. Nobody at your clinic did anything."],
    ["9:05pm", "Gets confirmation", "Branded email with tracking ID, date, time and a status-check link — sent automatically"],
    ["8:30am", "You see it", "It is already at the top of your dashboard when the clinic opens"]
  ];
  steps.forEach((st, i) => {
    const x = 0.7 + i * 3.05;
    card(s, x, 2.4, 2.8, 3.2);
    s.addShape(pres.ShapeType.roundRect, {
      x: x + 0.28, y: 2.68, w: 1.15, h: 0.38, rectRadius: 0.08, fill: { color: MINT }
    });
    s.addText(st[0], {
      x: x + 0.28, y: 2.68, w: 1.15, h: 0.38, margin: 0,
      fontFace: B, fontSize: 11, bold: true, color: DEEP, align: "center", valign: "middle"
    });
    s.addText(st[1], {
      x: x + 0.28, y: 3.22, w: 2.3, h: 0.45, margin: 0,
      fontFace: H, fontSize: 16, bold: true, color: INK
    });
    s.addText(st[2], {
      x: x + 0.28, y: 3.78, w: 2.3, h: 1.6, margin: 0,
      fontFace: B, fontSize: 11.5, color: MUTE, lineSpacing: 16
    });
    if (i < 3) {
      s.addText("→", {
        x: x + 2.82, y: 3.75, w: 0.25, h: 0.4, margin: 0,
        fontFace: B, fontSize: 20, bold: true, color: TEAL, align: "center"
      });
    }
  });

  card(s, 0.7, 5.85, 11.9, 0.85, DEEP);
  s.addText("Total staff time spent: zero minutes.", {
    x: 0.7, y: 5.85, w: 11.9, h: 0.85, margin: 0,
    fontFace: B, fontSize: 16, bold: true, color: MINT, align: "center", valign: "middle"
  });
  s.addNotes("Walk this out loud while showing the live site on your phone. Do not just present the slide.");
}

// ============================================================
// 7 — COMMAND CENTER (the money slide)
// ============================================================
{
  const s = darkSlide();
  s.addText("THE FRONT DESK", {
    x: 0.7, y: 0.5, w: 11.9, h: 0.3, margin: 0,
    fontFace: B, fontSize: 11, bold: true, color: MINT, charSpacing: 2.2
  });
  s.addText("Command Center", {
    x: 0.7, y: 0.95, w: 8, h: 0.7, margin: 0,
    fontFace: H, fontSize: 36, bold: true, color: "FFFFFF"
  });
  s.addText("Everyone in the clinic can see where every patient is — without shouting across reception.", {
    x: 0.7, y: 1.72, w: 9.5, h: 0.4, margin: 0,
    fontFace: B, fontSize: 15, color: "9FC4C7"
  });

  const cols = [
    ["Waiting Room", "3", "88B8BD"],
    ["Checkup", "2", MINT],
    ["Treatment", "1", MINT],
    ["Discharged", "5", "88B8BD"]
  ];
  cols.forEach((c, i) => {
    const x = 0.7 + i * 3.05;
    s.addShape(pres.ShapeType.roundRect, {
      x: x, y: 2.45, w: 2.85, h: 2.9, rectRadius: 0.1, fill: { color: "12414A" }
    });
    s.addText(c[0], {
      x: x + 0.22, y: 2.65, w: 1.9, h: 0.32, margin: 0,
      fontFace: B, fontSize: 13, bold: true, color: "FFFFFF"
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 2.25, y: 2.63, w: 0.36, h: 0.36, fill: { color: c[2] }
    });
    s.addText(c[1], {
      x: x + 2.25, y: 2.63, w: 0.36, h: 0.36, margin: 0,
      fontFace: B, fontSize: 11, bold: true, color: DEEP, align: "center", valign: "middle"
    });
    const n = parseInt(c[1]) > 3 ? 3 : parseInt(c[1]);
    for (let k = 0; k < n; k++) {
      s.addShape(pres.ShapeType.roundRect, {
        x: x + 0.22, y: 3.12 + k * 0.64, w: 2.4, h: 0.52, rectRadius: 0.07,
        fill: { color: "1B5560" }
      });
      s.addText("Patient  ·  APT10" + (24 + i * 3 + k), {
        x: x + 0.38, y: 3.12 + k * 0.64, w: 2.1, h: 0.52, margin: 0,
        fontFace: B, fontSize: 10, color: "C9E4E4", valign: "middle"
      });
    }
  });

  s.addText("Drag a card. That is the entire training.", {
    x: 0.7, y: 5.6, w: 11.9, h: 0.45, margin: 0,
    fontFace: H, fontSize: 22, bold: true, color: MINT, align: "center"
  });
  s.addText("If your receptionist can use WhatsApp, she can use this on day one.", {
    x: 0.7, y: 6.1, w: 11.9, h: 0.35, margin: 0,
    fontFace: B, fontSize: 14, color: "9FC4C7", align: "center"
  });
  s.addNotes("SLOW DOWN HERE. This is the moment they buy. Switch to the live dashboard and drag a real card. Then stop talking and let them ask for the mouse.");
}

// ============================================================
// 8 — AUTOMATED EMAILS
// ============================================================
{
  const s = lightSlide("Automation", "Five emails your clinic never has to write.");

  const mails = [
    ["Booking confirmed", "Tracking ID, date, time, service — and a link to check status", TEAL],
    ["Status updated", "The moment you confirm or change an appointment", TEAL],
    ["Doctor assigned", "The patient knows who they are seeing before they arrive", TEAL],
    ["Details changed", "Shows a clear before → after of the date, time or doctor", TEAL],
    ["Visit completed", "Thank-you + a Google review request. This one runs forever.", MINT]
  ];
  mails.forEach((m, i) => {
    const y = 2.3 + i * 0.79;
    card(s, 0.7, y, 7.5, 0.68, i === 4 ? DEEP : "FFFFFF");
    circleIcon(s, 0.92, y + 0.1, String(i + 1), i === 4 ? MINT : CARD, i === 4 ? DEEP : TEAL, 0.48);
    s.addText(m[0], {
      x: 1.55, y: y + 0.08, w: 2.5, h: 0.28, margin: 0,
      fontFace: B, fontSize: 13, bold: true, color: i === 4 ? "FFFFFF" : INK
    });
    s.addText(m[1], {
      x: 1.55, y: y + 0.35, w: 6.4, h: 0.26, margin: 0,
      fontFace: B, fontSize: 11, color: i === 4 ? "9FC4C7" : MUTE
    });
  });

  card(s, 8.6, 2.3, 4.0, 3.47, DEEP);
  s.addText("The one that\npays for itself", {
    x: 8.95, y: 2.6, w: 3.35, h: 0.85, margin: 0,
    fontFace: H, fontSize: 22, bold: true, color: MINT
  });
  s.addText("Every time you mark a patient Completed, they get a thank-you email with a Google review link.\n\nNobody has to remember. Nobody has to ask awkwardly at the desk.\n\nIt just runs — forever.", {
    x: 8.95, y: 3.6, w: 3.35, h: 1.95, margin: 0,
    fontFace: B, fontSize: 12.5, color: "C9E4E4", lineSpacing: 18
  });

  s.addText("All five are branded to your clinic — your name, your colours, your contact details.", {
    x: 0.7, y: 6.1, w: 11.9, h: 0.35, margin: 0,
    fontFace: B, fontSize: 14, italic: true, color: TEAL
  });
  s.addNotes("Reviews are the thing every dentist already worries about. Land that point hard — it is a genuine differentiator versus a plain agency website.");
}

// ============================================================
// 9 — WHAT'S INCLUDED
// ============================================================
{
  const s = lightSlide("Included", "Everything in the box.");

  const groups = [
    ["Patient website", ["Home, About, Services, Blog, Contact", "Mobile-first, fast-loading", "SEO: schema, Open Graph, canonical tags", "Online booking, 6 services", "Priority callback capture", "Self-service status page"]],
    ["Admin dashboard", ["Command Center patient flow", "Appointments: filter, search, sort", "Patient + doctor records", "Calendar view", "Invoice generator (PDF, ₹)", "CSV export to Excel"]],
    ["Behind the scenes", ["Double-booking prevented server-side", "Pause bookings instantly", "Staff logins with role control", "Automated patient emails", "MongoDB Atlas hosting", "SSL + custom domain"]]
  ];
  groups.forEach((g, i) => {
    const x = 0.7 + i * 4.05;
    card(s, x, 2.25, 3.75, 3.9);
    s.addShape(pres.ShapeType.roundRect, {
      x: x, y: 2.25, w: 3.75, h: 0.62, rectRadius: 0.12, fill: { color: TEAL }
    });
    s.addText(g[0], {
      x: x + 0.3, y: 2.25, w: 3.15, h: 0.62, margin: 0,
      fontFace: B, fontSize: 14, bold: true, color: "FFFFFF", valign: "middle"
    });
    s.addText(g[1].map((t, k) => ({
      text: t, options: { bullet: true, breakLine: k < g[1].length - 1 }
    })), {
      x: x + 0.3, y: 3.05, w: 3.15, h: 2.9, margin: 0,
      fontFace: B, fontSize: 11.5, color: INK, paraSpaceAfter: 8, lineSpacing: 15
    });
  });
  s.addText("Not included today: SMS/WhatsApp reminders, online payments, insurance claims, imaging. Ask us about the roadmap.", {
    x: 0.7, y: 6.4, w: 11.9, h: 0.35, margin: 0,
    fontFace: B, fontSize: 10.5, italic: true, color: MUTE
  });
  s.addNotes("The disclaimer line at the bottom is deliberate — it protects you. If they ask about SMS, say it is roadmap, not included. Never promise it.");
}

// ============================================================
// 10 — PRICING
// ============================================================
{
  const s = lightSlide("Investment", "Three ways to start.");

  const tiers = [
    ["STARTER", "₹24,999", "₹1,499", ["Website + booking", "Admin dashboard", "Automated emails", "1 staff login", "Email support (48h)"], false],
    ["PROFESSIONAL", "₹44,999", "₹2,499", ["Everything in Starter", "Command Center", "Invoice generator", "3 staff logins · 5 doctors", "Domain included, year 1", "Google review automation", "Phone support (24h)"], true],
    ["CLINIC PLUS", "₹79,999", "₹4,499", ["Everything in Professional", "Unlimited logins + doctors", "Unlimited content changes", "Monthly performance report", "Priority support (4h)"], false]
  ];
  tiers.forEach((t, i) => {
    const x = 0.7 + i * 4.05;
    const hot = t[4];
    const y = hot ? 2.05 : 2.25;
    const h = hot ? 4.25 : 3.85;
    card(s, x, y, 3.75, h, hot ? DEEP : "FFFFFF");
    if (hot) {
      s.addShape(pres.ShapeType.roundRect, {
        x: x + 2.35, y: y + 0.22, w: 1.15, h: 0.32, rectRadius: 0.08, fill: { color: MINT }
      });
      s.addText("POPULAR", {
        x: x + 2.35, y: y + 0.22, w: 1.15, h: 0.32, margin: 0,
        fontFace: B, fontSize: 8.5, bold: true, color: DEEP, align: "center", valign: "middle"
      });
    }
    s.addText(t[0], {
      x: x + 0.3, y: y + 0.24, w: 2.1, h: 0.3, margin: 0,
      fontFace: B, fontSize: 11.5, bold: true, color: hot ? MINT : TEAL, charSpacing: 1.5
    });
    s.addText(t[1], {
      x: x + 0.3, y: y + 0.62, w: 3.15, h: 0.6, margin: 0,
      fontFace: H, fontSize: 32, bold: true, color: hot ? "FFFFFF" : INK
    });
    s.addText("one-time setup", {
      x: x + 0.3, y: y + 1.2, w: 3.15, h: 0.25, margin: 0,
      fontFace: B, fontSize: 10.5, color: hot ? "88B8BD" : MUTE
    });
    s.addText("then " + t[2] + " / month", {
      x: x + 0.3, y: y + 1.48, w: 3.15, h: 0.3, margin: 0,
      fontFace: B, fontSize: 14, bold: true, color: hot ? MINT : TEAL
    });
    s.addText(t[3].map((f, k) => ({
      text: f, options: { bullet: true, breakLine: k < t[3].length - 1 }
    })), {
      x: x + 0.3, y: y + 1.92, w: 3.15, h: h - 2.15, margin: 0,
      fontFace: B, fontSize: 11, color: hot ? "C9E4E4" : INK, paraSpaceAfter: 7, lineSpacing: 14
    });
  });
  s.addText("Pay annually and get two months free.  ·  Founding-client rate available for the first five clinics.", {
    x: 0.7, y: 6.55, w: 11.9, h: 0.35, margin: 0,
    fontFace: B, fontSize: 12.5, italic: true, color: TEAL, align: "center"
  });
  s.addNotes("Anchor on Professional. Say the number once, calmly, then move immediately to the ROI slide. Do not apologise for the price and do not fill the silence.");
}

// ============================================================
// 11 — ROI
// ============================================================
{
  const s = darkSlide();
  s.addText("THE MATH", {
    x: 0.7, y: 0.55, w: 11.9, h: 0.3, margin: 0,
    fontFace: B, fontSize: 11, bold: true, color: MINT, charSpacing: 2.2
  });
  s.addText("Setup costs about one implant case.", {
    x: 0.7, y: 1.0, w: 11.9, h: 0.7, margin: 0,
    fontFace: H, fontSize: 36, bold: true, color: "FFFFFF"
  });

  const boxes = [
    ["₹44,999", "One-time setup", "≈ one implant case"],
    ["₹2,499", "Per month", "≈ ₹83 per day"],
    ["1", "Extra patient a month", "and it has already paid for itself"]
  ];
  boxes.forEach((b, i) => {
    const x = 0.7 + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x: x, y: 2.25, w: 3.75, h: 2.3, rectRadius: 0.12,
      fill: { color: i === 2 ? MINT : "12414A" }
    });
    s.addText(b[0], {
      x: x + 0.3, y: 2.52, w: 3.15, h: 0.85, margin: 0,
      fontFace: H, fontSize: 40, bold: true, color: i === 2 ? DEEP : MINT
    });
    s.addText(b[1], {
      x: x + 0.3, y: 3.42, w: 3.15, h: 0.32, margin: 0,
      fontFace: B, fontSize: 14, bold: true, color: i === 2 ? DEEP : "FFFFFF"
    });
    s.addText(b[2], {
      x: x + 0.3, y: 3.78, w: 3.15, h: 0.55, margin: 0,
      fontFace: B, fontSize: 12, color: i === 2 ? "0A2E36" : "9FC4C7", lineSpacing: 16
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 0.7, y: 4.95, w: 11.9, h: 1.55, rectRadius: 0.12, fill: { color: "12414A" }
  });
  s.addText("So, honestly — if this brought you one extra patient a month,\nwould that be worth ₹83 a day?", {
    x: 1.1, y: 5.2, w: 11.1, h: 1.05, margin: 0,
    fontFace: H, fontSize: 24, bold: true, italic: true, color: "FFFFFF", lineSpacing: 34
  });
  s.addNotes("Ask the question. Then STOP TALKING. Whoever speaks first loses. Count to ten in your head if you have to.");
}

// ============================================================
// 12 — VS THE ALTERNATIVES
// ============================================================
{
  const s = lightSlide("Alternatives", "What else you could do with the money.");

  const rows = [
    ["Do nothing", "Free", "You keep losing the calls you already miss. Your competitor's site takes them."],
    ["Practo Ray", "₹2,000+/mo", "You appear in a list next to twelve competing clinics. Their brand, not yours."],
    ["A local web agency", "₹20k–₹80k once", "You get a brochure. No dashboard, no automation, and nobody answers in month six."],
    ["DIY on Wix", "₹500/mo", "Your evenings. And still no front-desk dashboard."],
    ["Zenora", "₹44,999 + ₹2,499/mo", "Your brand, your patients, a real dashboard, automated emails — and a person you can call."]
  ];
  rows.forEach((r, i) => {
    const y = 2.3 + i * 0.82;
    const hot = i === 4;
    card(s, 0.7, y, 11.9, 0.7, hot ? DEEP : "FFFFFF");
    s.addText(r[0], {
      x: 1.05, y: y, w: 2.6, h: 0.7, margin: 0,
      fontFace: B, fontSize: 13.5, bold: true, color: hot ? MINT : INK, valign: "middle"
    });
    s.addText(r[1], {
      x: 3.75, y: y, w: 2.35, h: 0.7, margin: 0,
      fontFace: B, fontSize: 12.5, bold: true, color: hot ? "FFFFFF" : TEAL, valign: "middle"
    });
    s.addText(r[2], {
      x: 6.2, y: y, w: 6.15, h: 0.7, margin: 0,
      fontFace: B, fontSize: 11.5, color: hot ? "C9E4E4" : MUTE, valign: "middle"
    });
  });
  s.addText("The real competitor is \"do nothing.\" It is not free — it just bills you quietly.", {
    x: 0.7, y: 6.5, w: 11.9, h: 0.35, margin: 0,
    fontFace: B, fontSize: 13, italic: true, color: TEAL, align: "center"
  });
  s.addNotes("Only use this slide if they raise an alternative. If they haven't, skip it — don't introduce competitors they weren't thinking about.");
}

// ============================================================
// 13 — TIMELINE
// ============================================================
{
  const s = lightSlide("Delivery", "Live in seven days.");

  const days = [
    ["Day 1", "Kickoff", "You send logo, photos, doctor bios, services and hours"],
    ["Day 2–4", "Build", "Your clinic's content, branding and services configured"],
    ["Day 5", "Review", "You walk through it and tell us what to change"],
    ["Day 6", "Training", "30 minutes with your receptionist, live on the dashboard"],
    ["Day 7", "Live", "Domain connected, SSL on, taking real bookings"]
  ];
  days.forEach((d, i) => {
    const x = 0.7 + i * 2.44;
    card(s, x, 2.5, 2.25, 3.0);
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.82, y: 2.78, w: 0.6, h: 0.6, fill: { color: i === 4 ? MINT : TEAL }
    });
    s.addText(String(i + 1), {
      x: x + 0.82, y: 2.78, w: 0.6, h: 0.6, margin: 0,
      fontFace: B, fontSize: 17, bold: true, color: i === 4 ? DEEP : "FFFFFF",
      align: "center", valign: "middle"
    });
    s.addText(d[0], {
      x: x + 0.2, y: 3.55, w: 1.85, h: 0.28, margin: 0,
      fontFace: B, fontSize: 11, bold: true, color: TEAL, align: "center"
    });
    s.addText(d[1], {
      x: x + 0.2, y: 3.85, w: 1.85, h: 0.35, margin: 0,
      fontFace: H, fontSize: 16, bold: true, color: INK, align: "center"
    });
    s.addText(d[2], {
      x: x + 0.2, y: 4.28, w: 1.85, h: 1.1, margin: 0,
      fontFace: B, fontSize: 10.5, color: MUTE, align: "center", lineSpacing: 14
    });
  });

  card(s, 0.7, 5.75, 11.9, 0.95, DEEP);
  s.addText("Most agencies quote six weeks. We commit to a live date in writing — and we hit it.", {
    x: 0.7, y: 5.75, w: 11.9, h: 0.95, margin: 0,
    fontFace: B, fontSize: 15, bold: true, color: MINT, align: "center", valign: "middle"
  });
  s.addNotes("Speed is a genuine differentiator against local agencies. Commit to the date out loud — then actually hit it, because client one is your case study.");
}

// ============================================================
// 14 — CLOSE
// ============================================================
{
  const s = darkSlide();
  s.addShape(pres.ShapeType.ellipse, { x: -1.9, y: 4.0, w: 5.6, h: 5.6, fill: { color: TEAL }, transparency: 80 });
  s.addShape(pres.ShapeType.ellipse, { x: 10.6, y: -1.7, w: 4.4, h: 4.4, fill: { color: MINT }, transparency: 86 });

  s.addText("Let's get you booking\npatients at 9pm.", {
    x: 1.0, y: 1.85, w: 9.2, h: 1.7, margin: 0,
    fontFace: H, fontSize: 44, bold: true, color: "FFFFFF", lineSpacing: 52
  });
  s.addText("Start with a 30-day pilot. If it hasn't brought you a patient, don't pay the setup fee.", {
    x: 1.0, y: 3.7, w: 9.2, h: 0.5, margin: 0,
    fontFace: B, fontSize: 17, color: "C9E4E4"
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 4.6, w: 4.5, h: 0.72, rectRadius: 0.1, fill: { color: MINT }
  });
  s.addText("Book my clinic in", {
    x: 1.0, y: 4.6, w: 4.5, h: 0.72, margin: 0,
    fontFace: B, fontSize: 17, bold: true, color: DEEP, align: "center", valign: "middle"
  });

  s.addText("WhiteFox AI", {
    x: 1.0, y: 5.85, w: 6, h: 0.35, margin: 0,
    fontFace: B, fontSize: 15, bold: true, color: "FFFFFF"
  });
  s.addText("+91 87624 07565   ·   abhi.karnam4444@gmail.com   ·   whitefoxofficial.space", {
    x: 1.0, y: 6.22, w: 8, h: 0.35, margin: 0,
    fontFace: B, fontSize: 13, color: "7FA8AC"
  });
  s.addNotes("Close with the assumptive: 'Do you want to start with Professional, or would Clinic Plus fit better with the second chair coming?' Then be quiet.");
}

pres.writeFile({ fileName: "../Abhijay_Pitch_Deck.pptx" })
  .then(() => console.log("written"));
