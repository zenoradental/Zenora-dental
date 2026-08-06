// Build deploy trigger v2026.07.01 - Add PUT appointment endpoint
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// Sentry must be initialised before anything else it instruments is required.
// With no SENTRY_DSN set this is inert, so local development is unaffected.
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    tracesSampleRate: 0,
    // Never let patient data or credentials leave the building in a crash report.
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
      }
      return event;
    }
  });
  console.log('Sentry error reporting enabled.');
}

const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch (e) {}
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { waitUntil } = require('@vercel/functions');


const app = express();
// Vercel terminates TLS in front of us; needed so rate limiting sees the real client IP.
app.set('trust proxy', 1);

// --- CORS: explicit allowlist, no wildcard ---
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

if (ALLOWED_ORIGINS.length === 0) {
  console.warn('WARNING: ALLOWED_ORIGINS is not set. All cross-origin browser requests will be refused.');
}

app.use(cors({
  origin: (origin, callback) => {
    // Requests with no Origin header are server-to-server or same-origin; nothing to protect.
    if (!origin) return callback(null, true);
    callback(null, ALLOWED_ORIGINS.includes(origin.replace(/\/$/, '')));
  },
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));

// --- Shared helpers ---
// Escape user input before it is interpolated into a Mongo regex query.
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Escape user-supplied values before interpolating them into any HTML we emit.
// Every value that reaches an email template or an HTML response goes through this.
const escapeHtml = (value) => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// --- Request validation ---
// Every route body and param is validated and length-capped before it reaches
// the database or an email template.
const trimmed = (max) => z.string().trim().max(max);
const optionalText = (max) => trimmed(max).optional();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{1,2}:\d{2}\s*(AM|PM)$/i;

const APPOINTMENT_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
const APPOINTMENT_STAGES = ['Waiting Room', 'Checkup', 'Treatment', 'Discharged'];

const schemas = {
  // Public booking. Accepts both the website's field names (name/date/time/notes)
  // and the canonical ones, because both are in use across the static pages.
  createAppointment: z.object({
    name: optionalText(120),
    patientName: optionalText(120),
    email: trimmed(200).email().optional().or(z.literal('')),
    phone: optionalText(25),
    age: z.union([z.coerce.number().int().min(0).max(120), z.literal('')]).optional(),
    gender: optionalText(20),
    service: optionalText(120),
    date: optionalText(20),
    appointmentDate: optionalText(20),
    time: optionalText(20),
    appointmentTime: optionalText(20),
    notes: optionalText(2000),
    symptoms: optionalText(2000),
    medicalHistory: optionalText(2000),
    address: optionalText(300),
    website: optionalText(200) // honeypot
  }).strip(),

  updateAppointment: z.object({
    patientName: optionalText(120),
    age: z.coerce.number().int().min(0).max(120).nullable().optional(),
    gender: optionalText(20),
    phone: optionalText(25),
    email: trimmed(200).email().optional().or(z.literal('')),
    service: optionalText(120),
    symptoms: optionalText(2000),
    doctor: optionalText(120),
    appointmentDate: trimmed(20).regex(DATE_RE, 'Expected YYYY-MM-DD').optional(),
    appointmentTime: trimmed(20).regex(TIME_RE, 'Expected e.g. 09:30 AM').optional(),
    status: z.enum(APPOINTMENT_STATUSES).optional(),
    address: optionalText(300),
    medicalHistory: optionalText(2000)
  }).strip(),

  appointmentStatus: z.object({ status: z.enum(APPOINTMENT_STATUSES) }).strip(),
  appointmentStage: z.object({ stage: z.enum(APPOINTMENT_STAGES) }).strip(),
  appointmentDoctor: z.object({ doctor: trimmed(120) }).strip(),

  login: z.object({
    email: trimmed(200).min(1),
    password: z.string().min(1).max(128)
  }).strip(),

  changePassword: z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(12).max(128)
  }).strip(),

  createAdmin: z.object({
    email: trimmed(200).email(),
    password: z.string().min(12).max(128),
    role: z.enum(['Administrator', 'Master Admin']).optional()
  }).strip(),

  adminRole: z.object({ role: z.enum(['Administrator', 'Master Admin']) }).strip(),
  adminPassword: z.object({ password: z.string().min(12).max(128) }).strip(),

  settings: z.object({
    maintenanceMode: z.boolean().optional(),
    pauseBookings: z.boolean().optional()
  }).strip(),

  doctor: z.object({
    name: trimmed(120).min(1),
    specialization: trimmed(120).min(1),
    status: z.enum(['Available', 'On Leave', 'Unavailable']).optional(),
    phone: optionalText(25),
    email: trimmed(200).email().optional().or(z.literal(''))
  }).strip(),

  doctorUpdate: z.object({
    name: trimmed(120).optional(),
    specialization: trimmed(120).optional(),
    status: z.enum(['Available', 'On Leave', 'Unavailable']).optional(),
    phone: optionalText(25),
    email: trimmed(200).email().optional().or(z.literal(''))
  }).strip(),

  servicePrice: z.object({
    serviceName: trimmed(120).min(1),
    price: z.coerce.number().min(0).max(10000000)
  }).strip(),

  // Tracking IDs: legacy APT1042 and current APT1042K7XQ both match.
  appointmentIdParam: trimmed(40).regex(/^[A-Za-z0-9-]+$/, 'Invalid appointment ID')
};

/** Express middleware: validate req.body against a schema, replacing it with the parsed result. */
const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    const field = issue.path.join('.') || 'body';
    return res.status(400).json({ error: `${field}: ${issue.message}` });
  }
  req.body = result.data;
  next();
};

/** Express middleware: validate a single route param. */
const validateParam = (name, schema) => (req, res, next) => {
  const result = schema.safeParse(req.params[name]);
  if (!result.success) {
    return res.status(400).json({ error: `${name}: ${result.error.issues[0].message}` });
  }
  req.params[name] = result.data;
  next();
};

const validAptId = validateParam('id', schemas.appointmentIdParam);

// --- Clinic identity ---
// Everything clinic-specific lives here so one codebase can be deployed per clinic
// by changing environment variables only. See DEPLOY_CLINIC.md.
const CLINIC = {
  name: process.env.CLINIC_NAME || 'Zenora Dental',
  phone: process.env.CLINIC_PHONE || '',
  email: process.env.CLINIC_EMAIL || '',
  reviewUrl: process.env.CLINIC_REVIEW_URL || '',
  frontendUrl: (process.env.FRONTEND_URL || '').replace(/\/$/, '')
};

const CLINIC_FROM_ADDRESS = process.env.CLINIC_FROM_ADDRESS || process.env.SMTP_FROM_EMAIL || '';

/** RFC 5322 From header for outbound clinic mail, or '' when no sender is configured. */
const mailFrom = () => CLINIC_FROM_ADDRESS ? `${CLINIC.name} <${CLINIC_FROM_ADDRESS}>` : '';

if (!CLINIC_FROM_ADDRESS) {
  console.warn('WARNING: CLINIC_FROM_ADDRESS is not set. Outbound email will be skipped.');
}

// --- Authentication ---
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '8h';
const BCRYPT_ROUNDS = 12;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Every authenticated API route will reject all requests.');
}

const signToken = (admin) => jwt.sign(
  { id: admin.id, email: admin.email, role: admin.role },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRY }
);

const readToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token || !JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const requireAuth = (req, res, next) => {
  const payload = readToken(req);
  if (!payload) return res.status(401).json({ error: 'Authentication required' });
  // Identity and role come from the signed token only, never from the request body.
  req.user = { id: payload.id, email: payload.email, role: payload.role };
  next();
};

const requireMasterAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'Master Admin') {
      return res.status(403).json({ error: 'Master Admin privileges required' });
    }
    next();
  });
};

// The only routes under /api/ reachable without a JWT. Everything else requires one.
const PUBLIC_API_ROUTES = [
  { method: 'POST', pattern: /^\/api\/appointments\/?$/ },        // patients book
  { method: 'GET',  pattern: /^\/api\/appointments\/[^/]+\/?$/ }, // patients check status (phone-gated)
  { method: 'GET',  pattern: /^\/api\/availability\/?$/ },        // booked slot times only, no patient data
  { method: 'POST', pattern: /^\/api\/auth\/login\/?$/ },         // issues the JWT
  { method: 'POST', pattern: /^\/api\/inbound\/?$/ }              // mail provider webhook, secret-gated at the route
];

const isPublicApiRoute = (req) =>
  PUBLIC_API_ROUTES.some(r => r.method === req.method && r.pattern.test(req.path));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  if (!req.path.startsWith('/api/')) return next();
  if (isPublicApiRoute(req)) return next();
  return requireAuth(req, res, next);
});

// Admin account management and system settings are Master Admin only.
app.use('/api/admins', requireMasterAdmin);

// --- Rate limiting ---
// NOTE: the default in-memory store is per serverless instance and resets on cold start.
// See DEPLOY_CLINIC.md for the Redis-backed store needed for a hard guarantee.
const intFromEnv = (name, fallback) => {
  const parsed = parseInt(process.env[name], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: intFromEnv('LOGIN_RATE_LIMIT', 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: intFromEnv('BOOKING_RATE_LIMIT', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking requests from this network. Please try again later.' }
});

// Nodemailer Dual-Port Failover Transporter Setup
let transporter = null;
let fallbackTransporter = null;

const setupTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isResend = process.env.SMTP_USER === 'resend';
    const host = isResend ? 'smtp.resend.com' : (process.env.SMTP_HOST || 'smtp.gmail.com');
    
    const ipv4Lookup = (hostname, options, callback) => dns.lookup(hostname, { family: 4 }, callback);

    // Primary: Port 587 (STARTTLS) with forced IPv4 socket lookup
    transporter = nodemailer.createTransport({
      host: host,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 4000,
      socketOptions: { lookup: ipv4Lookup },
      tls: isResend ? { lookup: ipv4Lookup } : { servername: host, lookup: ipv4Lookup }
    });

    // Fallback: Port 465 (SSL/TLS direct) with forced IPv4 socket lookup
    fallbackTransporter = nodemailer.createTransport({
      host: host,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 4000,
      socketOptions: { lookup: ipv4Lookup },
      tls: isResend ? { lookup: ipv4Lookup } : { servername: host, lookup: ipv4Lookup }
    });

    console.log('Using configured SMTP credentials with IPv4 failover.');
  } else {
    console.warn('No SMTP credentials found in environment. Email sending will be disabled.');
    transporter = null;
    fallbackTransporter = null;
  }
};
setupTransporter();

async function sendEmailReliably(mailOptions) {
  if (process.env.SMTP_USER === 'resend') {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SMTP_PASS}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
          text: mailOptions.text
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Resend API Error');
      console.log('Email sent successfully via Resend API: %s', data.id);
      return { messageId: data.id };
    } catch (err) {
      console.error('Resend API dispatch failed:', err.message || err);
      throw err;
    }
  }

  if (!transporter && !fallbackTransporter) {
    console.warn('Email sending skipped: No SMTP credentials configured.');
    return null;
  }
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via primary port 465: %s', info.messageId);
    return info;
  } catch (err1) {
    console.warn('Primary email dispatch (port 465) failed, retrying via fallback port 587...', err1.message || err1);
    if (fallbackTransporter) {
      try {
        const info2 = await fallbackTransporter.sendMail(mailOptions);
        console.log('Email sent successfully via fallback port 587: %s', info2.messageId);
        return info2;
      } catch (err2) {
        console.error('Both primary (465) and fallback (587) email dispatch failed:', err2.message || err2);
        throw err2;
      }
    } else {
      throw err1;
    }
  }
}



// Email icon assets. Override EMAIL_ASSET_BASE_URL for a white-labelled deployment.
const EMAIL_ASSET_BASE = (process.env.EMAIL_ASSET_BASE_URL || 'https://www.whitefoxofficial.space/assets/img').replace(/\/$/, '');
const emailIcon = (file, alt) =>
  `<img src="${EMAIL_ASSET_BASE}/${file}" alt="${alt}" style="width: 24px; height: 24px; display: block; border: 0;" />`;

const calendarIcon = emailIcon('gen_icon-calendar.png', 'Calendar');
const doctorIcon = emailIcon('gen_icon-user.png', 'Doctor');
const clockIcon = emailIcon('gen_icon-clock.png', 'Clock');
const toothIcon = emailIcon('gen_icon-tooth.png', 'Tooth');
const infoIcon = emailIcon('gen_icon-info.png', 'Info');

const generateEmailHTML = (title, patientName, paragraphs, highlights, cta, iconSvg, postHighlightsParagraphs = []) => {
  const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`;
  const icon = iconSvg || defaultIcon;

  // Every value that can originate from a patient or an admin form is escaped here.
  // `paragraphs` and `postHighlightsParagraphs` are the exception: some callers pass
  // deliberate markup, so those callers escape the values they interpolate themselves.
  const safeTitle = escapeHtml(title);
  const safeName = escapeHtml(patientName);
  const safeHighlights = (highlights || []).map(h => ({
    label: escapeHtml(h.label),
    value: escapeHtml(h.value)
  }));
  const safeCta = cta ? { text: escapeHtml(cta.text), url: encodeURI(String(cta.url || '')) } : null;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="background-color: #F3F4F6; padding: 50px 15px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <!-- Main Email Container with subtle premium shadow -->
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
              <tr>
                <td style="padding: 50px 40px 10px 40px; text-align: center;">
                  <h1 style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 30px; font-weight: 700; letter-spacing: 4px; color: #111827; text-transform: uppercase;">
                    ${escapeHtml(CLINIC.name)}
                  </h1>
                  <div style="margin: 25px auto 30px auto; width: 40px; height: 1px; background-color: #E5E7EB;"></div>
                  
                  <!-- The Professional Icon Circle or Hero Image -->
                  ${icon && (icon.includes('<svg') || icon.includes('<img')) ? `
                  <div style="display: inline-block; width: 24px; height: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; padding: 16px; margin-bottom: 20px; color: #475569;">
                    ${icon}
                  </div>
                  ` : icon && icon.startsWith('http') ? `
                  <div style="margin-bottom: 30px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <img src="${icon}" alt="Notification Image" style="width: 100%; max-width: 600px; height: auto; display: block;" />
                  </div>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 50px 40px 50px; text-align: center;">
                  <h2 style="margin: 0 0 25px 0; font-size: 18px; font-weight: 500; color: #374151; letter-spacing: 0.5px;">
                    ${safeTitle}
                  </h2>
                  <div style="text-align: left; margin-bottom: 30px;">
                    <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">
                      Dear <strong style="color: #111827; font-weight: 500;">${safeName}</strong>,
                    </p>
                    ${paragraphs && paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">${p}</p>`).join('') : ''}
                  </div>
                  ${safeHighlights.length > 0 ? `
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px 25px; margin-bottom: 30px; text-align: left;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${safeHighlights.map((h, i) => `
                        <tr>
                          <td style="padding: 10px 0; ${i !== safeHighlights.length - 1 ? 'border-bottom: 1px solid #F1F5F9;' : ''} color: #64748B; font-size: 14px; width: 40%; font-weight: 500;">
                            ${h.label}
                          </td>
                          <td style="padding: 10px 0; ${i !== safeHighlights.length - 1 ? 'border-bottom: 1px solid #F1F5F9;' : ''} color: #0F172A; font-size: 15px; font-weight: 600; text-align: right;">
                            ${h.value}
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </div>
                  ` : ''}
                  ${postHighlightsParagraphs && postHighlightsParagraphs.length > 0 ? `
                  <div style="text-align: left; margin-bottom: 30px;">
                    ${postHighlightsParagraphs.map(p => `<p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">${p}</p>`).join('')}
                  </div>
                  ` : ''}
                  ${safeCta ? `
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${safeCta.url}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 18px 40px; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 4px;">
                          ${safeCta.text}
                        </a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 50px 40px 50px; text-align: center;">
                  <div style="margin: 10px auto 30px auto; width: 60px; height: 1px; background-color: #E5E7EB;"></div>
                  ${CLINIC.phone || CLINIC.email ? `
                  <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.8;">
                    <strong>Contact Us</strong><br>
                    ${CLINIC.phone ? `📞 ${escapeHtml(CLINIC.phone)}<br>` : ''}
                    ${CLINIC.email ? `✉️ ${escapeHtml(CLINIC.email)}` : ''}
                  </p>
                  ` : ''}
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 30px; text-align: center; border-top: 1px solid #F3F4F6;">
                  <p style="margin: 0 0 10px 0; font-size: 11px; color: #9CA3AF; letter-spacing: 1px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} ${escapeHtml(CLINIC.name)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;
};
app.get('/api/test-email-diagnostic', async (req, res) => {
  if (!transporter && !fallbackTransporter) {
    return res.status(500).json({ status: 'error', message: 'Transporters are null' });
  }
  try {
    // Attempt to send a test email
    const fromAddress = mailFrom();
        
      const info = await sendEmailReliably({
        from: fromAddress,
        to: process.env.SMTP_USER === 'resend' ? process.env.SMTP_FROM_EMAIL : process.env.SMTP_USER, // Send to itself to test
        subject: 'Diagnostic Test Email',
      text: 'If you receive this, email sending works perfectly on Vercel!'
    });
    
    res.json({ 
      status: 'success', 
      message: 'Diagnostic test email sent successfully (v2.0)!',
      info: info.messageId
    });
  } catch (error) {
    res.status(500).json({ status: 'error', errorName: error.name, errorMessage: error.message, stack: error.stack });
  }
});

// Mongoose MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

// Schemas and Models
const adminSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Administrator' },
  mustChangePassword: { type: Boolean, default: false }
});
const Admin = mongoose.model('Admin', adminSchema);

const settingSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  pauseBookings: { type: Boolean, default: false }
});
const Setting = mongoose.model('Setting', settingSchema);

const doctorSchema = new mongoose.Schema({
  id: { type: String, unique: true, index: true },
  name: String,
  specialization: String,
  status: { type: String, default: 'Available' },
  phone: String,
  email: String
});
const Doctor = mongoose.model('Doctor', doctorSchema);

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true, index: true },
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
  status: { type: String, default: 'Pending' },
  stage: { type: String, default: 'Waiting Room' },
  address: String,
  medicalHistory: String,
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
  // Stamped from the service price list when the appointment is marked Completed.
  // null means "no revenue recorded" — analytics must not invent a figure for it.
  price: { type: Number, default: null },
  currency: { type: String, default: 'INR' }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Atomic sequence source for appointment tracking IDs. See generateId().
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
});
const Counter = mongoose.model('Counter', counterSchema);

// The clinic's price list. A completed appointment copies the current price of its
// service, so later price changes do not rewrite historical revenue.
const servicePriceSchema = new mongoose.Schema({
  clinicId: { type: String, default: 'default', index: true },
  serviceName: { type: String, required: true },
  price: { type: Number, required: true }
});
servicePriceSchema.index({ clinicId: 1, serviceName: 1 }, { unique: true });
const ServicePrice = mongoose.model('ServicePrice', servicePriceSchema);

// Append-only record of who changed what. Written on every status change, doctor
// assignment, edit and delete.
const auditLogSchema = new mongoose.Schema({
  actor: String,        // admin id
  actorEmail: String,
  action: String,       // e.g. 'appointment.status'
  entity: String,       // e.g. 'Appointment'
  entityId: String,
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true }
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

/**
 * Write an audit entry. Never throws — an audit failure must not fail the
 * operation the user asked for, but it is logged loudly so it is not silent.
 */
const writeAudit = async (req, { action, entity, entityId, before, after }) => {
  try {
    await AuditLog.create({
      actor: req.user?.id || 'system',
      actorEmail: req.user?.email || '',
      action,
      entity,
      entityId,
      before: before ?? null,
      after: after ?? null,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('AUDIT WRITE FAILED', { action, entity, entityId }, err.message || err);
  }
};

// The clinic identifier this deployment serves. Single-tenant for now: one Vercel
// project and one Mongo database per clinic. See DEPLOY_CLINIC.md for the
// multi-tenancy plan (needed around client #8).
const CLINIC_ID = process.env.CLINIC_ID || 'default';

// Cryptographically random password. Excludes look-alike characters (0/O, 1/l/I)
// so it survives being read off a screen and typed by hand.
const generateRandomPassword = (length = 16) => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const limit = 256 - (256 % alphabet.length);
  let out = '';
  while (out.length < length) {
    for (const b of crypto.randomBytes(length)) {
      // Reject values in the biased tail so every character is uniformly likely.
      if (b >= limit) continue;
      out += alphabet[b % alphabet.length];
      if (out.length === length) break;
    }
  }
  return out;
};

// Database Initialization
const initializeDb = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      // No hardcoded credentials. Generate a random password, hash it, and show the
      // plaintext exactly once in the boot logs. The account cannot be used for
      // anything until this password is changed.
      const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@zenoradental.com';
      const seedPassword = generateRandomPassword(16);
      await Admin.create({
        id: 'ADM0001',
        email: seedEmail,
        password: await bcrypt.hash(seedPassword, BCRYPT_ROUNDS),
        role: 'Master Admin',
        mustChangePassword: true
      });
      console.log('');
      console.log('==============================================================');
      console.log('  SAVE THIS NOW — SHOWN ONLY ONCE');
      console.log('  A Master Admin account was created on this empty database.');
      console.log('');
      console.log(`  Email:    ${seedEmail}`);
      console.log(`  Password: ${seedPassword}`);
      console.log('');
      console.log('  You will be forced to change this password at first login.');
      console.log('  This password is not stored anywhere in plaintext and cannot');
      console.log('  be recovered from the database.');
      console.log('==============================================================');
      console.log('');
    }

    // Seed the ID counter past any pre-existing sequential IDs, so the first
    // atomically-generated ID cannot collide with an APT1042-style legacy record.
    const existingCounter = await Counter.findOne({ _id: 'appointmentId' });
    if (!existingCounter) {
      const ids = await Appointment.find({}, { appointmentId: 1, _id: 0 }).lean();
      let maxSeq = 1000;
      for (const row of ids) {
        const m = /^APT(\d+)/.exec(row.appointmentId || '');
        if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
      }
      await Counter.create({ _id: 'appointmentId', seq: maxSeq });
      console.log(`Appointment ID counter initialised at ${maxSeq}.`);
    }

    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      await Setting.create({ maintenanceMode: false, pauseBookings: false });
      console.log('Default Settings created.');
    }

    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await Doctor.create([
        { id: 'DOC0001', name: 'Dr. Sarah Jenkins', specialization: 'General Dentist', status: 'Available', phone: '555-0101', email: 'sarah.j@zenora.com' },
        { id: 'DOC0002', name: 'Dr. Michael Chen', specialization: 'Orthodontist', status: 'Available', phone: '555-0102', email: 'm.chen@zenora.com' },
        { id: 'DOC0003', name: 'Dr. Emily Rodriguez', specialization: 'Periodontist', status: 'On Leave', phone: '555-0103', email: 'e.rodriguez@zenora.com' },
        { id: 'DOC0004', name: 'Dr. James Wilson', specialization: 'Oral Surgeon', status: 'Available', phone: '555-0104', email: 'j.wilson@zenora.com' }
      ]);
      console.log('Default Doctors created.');
    }
  } catch (err) {
    console.error('Error initializing DB defaults:', err);
  }
};

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) {
    console.log('WARNING: Starting without MongoDB connection. Please configure MONGODB_URI.');
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    await initializeDb();
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});


/**
 * Allocate a tracking ID: 'APT' + an atomic sequence + 4 random characters,
 * e.g. APT1042K7XQ.
 *
 * The sequence comes from a single atomic findOneAndUpdate/$inc, so two
 * simultaneous bookings can never be handed the same number — which is what
 * previously caused the second booking to hit the unique index and 500.
 * The random suffix means a valid ID cannot be derived by counting upwards
 * from someone else's.
 */
const ID_SUFFIX_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'appointmentId' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  let suffix = '';
  for (const b of crypto.randomBytes(4)) {
    suffix += ID_SUFFIX_ALPHABET[b % ID_SUFFIX_ALPHABET.length];
  }

  return `APT${counter.seq}${suffix}`;
};

// GET all appointments (authenticated staff only)
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find({ deletedAt: null }).sort({ createdAt: -1, _id: -1 }).lean();
    res.json(appointments);
  } catch (err) {
    console.error('Failed to read appointments:', err);
    res.status(500).json({ error: 'Failed to read appointments', details: err.message });
  }
});

// GET /api/availability?date=YYYY-MM-DD — public.
// Returns booked time strings for one date and nothing else. No patient fields.
app.get('/api/availability', async (req, res) => {
  try {
    const { date } = req.query;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'A date query parameter in YYYY-MM-DD format is required' });
    }

    const rows = await Appointment.find({
      appointmentDate: date,
      status: { $ne: 'Cancelled' },
      deletedAt: null
    }).select('appointmentTime -_id').lean();

    const booked = [...new Set(rows.map(r => r.appointmentTime).filter(Boolean))];
    res.setHeader('Cache-Control', 'no-store');
    res.json({ booked });
  } catch (err) {
    console.error('Failed to read availability:', err);
    res.status(500).json({ error: 'Failed to read availability' });
  }
});

// GET a single appointment by ID — public, but requires the last 4 digits of the
// phone number on the record. Mismatches return 404 so tracking IDs cannot be
// enumerated by watching for a different status code.
app.get('/api/appointments/:id', validAptId, async (req, res) => {
  try {
    const { phone } = req.query;
    if (typeof phone !== 'string' || phone.trim() === '') {
      return res.status(400).json({ error: 'A phone query parameter is required to look up an appointment' });
    }

    const appointment = await Appointment.findOne({ appointmentId: req.params.id, deletedAt: null }).lean();

    const last4 = (value) => String(value || '').replace(/\D/g, '').slice(-4);
    const supplied = last4(phone);

    if (!appointment || supplied.length !== 4 || supplied !== last4(appointment.phone)) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only the fields the patient-facing status page needs.
    res.json({
      appointmentId: appointment.appointmentId,
      patientName: appointment.patientName,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      service: appointment.service,
      doctor: appointment.doctor
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read appointment' });
  }
});

// POST a new appointment
app.post('/api/appointments', bookingLimiter, validateBody(schemas.createAppointment), async (req, res) => {
  try {
    const newApt = req.body || {};

    // Honeypot: a real browser leaves this hidden field empty. Bots fill it in.
    // Respond as if the booking succeeded so the script gets no useful signal.
    if (typeof newApt.website === 'string' && newApt.website.trim() !== '') {
      console.warn('Rejected booking: honeypot field was filled.');
      return res.status(201).json({ success: true, appointment: { appointmentId: 'APT0000' } });
    }

    const setting = await Setting.findOne();
    if (setting && setting.pauseBookings) {
      return res.status(403).json({ error: 'We are temporarily not accepting new appointments.' });
    }

    const isPriority = newApt.service && newApt.service.toLowerCase().includes('priority');

    const dateVal = newApt.date || newApt.appointmentDate || '';
    const timeVal = newApt.time || newApt.appointmentTime || '';

    // Check if slot is booked (skip unique check for priority callback requests)
    let isBooked = false;
    if (!isPriority && dateVal && timeVal) {
      isBooked = await Appointment.exists({
        appointmentDate: dateVal,
        appointmentTime: timeVal,
        status: { $ne: 'Cancelled' },
        deletedAt: null
      });
    }

    if (isBooked) {
      return res.status(400).json({ error: 'This time slot is already booked by another patient. Please choose a different date or time.' });
    }
    
    const nextAptId = await generateId();

    const appointmentRecord = new Appointment({
      appointmentId: nextAptId,
      patientName: newApt.patientName || newApt.name || 'New Patient',
      age: newApt.age ? parseInt(newApt.age) : null,
      gender: newApt.gender || '-',
      phone: newApt.phone || '',
      email: newApt.email || '',
      service: newApt.service || 'General Checkup',
      symptoms: newApt.notes || newApt.symptoms || 'No notes provided',
      doctor: 'Unassigned',
      appointmentDate: dateVal,
      appointmentTime: timeVal,
      status: 'Pending',
      address: 'Not provided',
      medicalHistory: newApt.medicalHistory || 'Not provided',
      createdAt: new Date()
    });
    
    await appointmentRecord.save();
    
    // Send email notification reliably before ending request
    if ((transporter || fallbackTransporter) && appointmentRecord.email) {
      const fromAddress = mailFrom();
        
      const mailOptions = {
        from: fromAddress,
        to: appointmentRecord.email,
        subject: `Appointment Confirmed - Tracking ID: ${appointmentRecord.appointmentId}`,
        text: `Appointment Confirmed! Thank you, ${appointmentRecord.patientName}. Your Tracking ID is ${appointmentRecord.appointmentId}. Service: ${appointmentRecord.service || 'General Checkup'}. Date: ${appointmentRecord.appointmentDate}. Time: ${appointmentRecord.appointmentTime}. Please ensure you arrive 10 minutes prior to your scheduled time.`,
        html: generateEmailHTML(
          'Appointment Confirmed',
          appointmentRecord.patientName,
          [
            `We are writing to confirm that your appointment request has been successfully received by our administration team. At <strong>${escapeHtml(CLINIC.name)}</strong>, your oral health and comfort are our top priorities, and we look forward to providing you with exceptional care.`,
            'Please ensure you arrive 10 minutes prior to your scheduled time. If you have any questions or need to reschedule, please contact our support team.'
          ],
          [
            { label: 'Tracking ID', value: appointmentRecord.appointmentId },
            { label: 'Date', value: appointmentRecord.appointmentDate },
            { label: 'Time', value: appointmentRecord.appointmentTime },
            { label: 'Service', value: appointmentRecord.service || 'General Checkup' }
          ],
          { text: 'Check Appointment Status', url: `${CLINIC.frontendUrl}/check-status.html` },
          calendarIcon
        )
      };

      try {
        const info = await sendEmailReliably(mailOptions);
        if (info) console.log("Email sent: %s", info.messageId);
      } catch (emailErr) {
        console.error("Non-fatal error sending confirmation email:", emailErr.message || emailErr);
      }
    }

    res.status(201).json({ success: true, appointment: appointmentRecord });
  } catch (err) {
    console.error("Fatal error saving appointment:", err);
    res.status(500).json({ error: 'Failed to save appointment', details: err.message });
  }
});

// PATCH update appointment stage
app.patch('/api/appointments/:id/stage', validAptId, validateBody(schemas.appointmentStage), async (req, res) => {
  try {
    const { stage } = req.body;

    const existing = await Appointment.findOne({ appointmentId: req.params.id, deletedAt: null }).lean();

    const updatedApt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.id, deletedAt: null },
      { stage },
      { new: true }
    );

    if (!updatedApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await writeAudit(req, {
      action: 'appointment.stage',
      entity: 'Appointment',
      entityId: updatedApt.appointmentId,
      before: { stage: existing?.stage ?? null },
      after: { stage }
    });

    res.json({ success: true, stage });
  } catch (error) {
    console.error("Error updating appointment stage:", error);
    res.status(500).json({ error: 'Failed to update appointment stage' });
  }
});

// PATCH update appointment status
app.patch('/api/appointments/:id/status', validAptId, validateBody(schemas.appointmentStatus), async (req, res) => {
  try {
    const { status } = req.body;

    const existing = await Appointment.findOne({ appointmentId: req.params.id, deletedAt: null }).lean();
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const update = { status };

    // Stamp the price at the moment of completion, from the current price list.
    // Copying it onto the record means a later price change does not rewrite
    // historical revenue. Appointments with no matching price keep price: null,
    // and analytics reports them as "no price recorded" rather than guessing.
    if (status === 'Completed' && existing.price == null) {
      const priceRow = await ServicePrice.findOne({
        clinicId: CLINIC_ID,
        serviceName: existing.service
      }).lean();
      if (priceRow) {
        update.price = priceRow.price;
        update.currency = 'INR';
      }
    }

    const updatedApt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.id, deletedAt: null },
      update,
      { new: true }
    );

    if (!updatedApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await writeAudit(req, {
      action: 'appointment.status',
      entity: 'Appointment',
      entityId: updatedApt.appointmentId,
      before: { status: existing.status, price: existing.price ?? null },
      after: { status, price: updatedApt.price ?? null }
    });

    // Send email notification for status change
    if ((transporter || fallbackTransporter) && updatedApt.email) {
      const fromAddress = mailFrom();
        
      let subject = `Appointment Status Updated - ${CLINIC.name}`;
      let htmlBody = generateEmailHTML(
        'Appointment Status Update',
        updatedApt.patientName,
        [
          'Your appointment status has been updated. Please find the details of your appointment below:',
          'If you have any questions or require further assistance, please do not hesitate to contact our support team.'
        ],
        [
          { label: 'Status', value: status },
          { label: 'Date', value: updatedApt.appointmentDate },
          { label: 'Time', value: updatedApt.appointmentTime },
          ...(updatedApt.doctor && updatedApt.doctor !== 'Unassigned' ? [{ label: 'Doctor', value: updatedApt.doctor }] : [])
        ],
        null,
        clockIcon
      );

      if (status === 'Completed') {
        subject = `Thank you for visiting ${CLINIC.name}!`;

        // The review paragraph and CTA only go out when a real review URL is
        // configured. Without CLINIC_REVIEW_URL we omit both rather than mailing
        // patients a dead link.
        const reviewParagraphs = CLINIC.reviewUrl ? [
          'As a growing practice, the trust and feedback of our patients are vital to our success. If you are satisfied with the care you received, we would be incredibly grateful if you could take a brief moment to share your experience on Google.',
          'Your insights not only help us continually improve, but they also guide others in our community who are seeking reliable, high-quality dental care.'
        ] : [];

        htmlBody = generateEmailHTML(
          `Thank you for visiting ${CLINIC.name}.`,
          updatedApt.patientName,
          [
            'It was a privilege to welcome you to our clinic today. We are deeply committed to providing state-of-the-art dental care in a comfortable, welcoming environment, and we sincerely hope that your experience reflected our highest standards. Your oral health and satisfaction are our absolute top priorities.',
            ...reviewParagraphs
          ],
          null, // No highlights needed here
          CLINIC.reviewUrl ? { text: 'Review on Google', url: CLINIC.reviewUrl } : null,
          toothIcon
        );
      }

      const mailOptions = {
        from: fromAddress,
        to: updatedApt.email,
        subject: subject,
        html: htmlBody
      };
      try {
        const info = await sendEmailReliably(mailOptions);
        if (info) console.log("Status email sent:", info.messageId);
      } catch (err) {
        console.error("Error sending status email:", err);
      }
    }

    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// PATCH update appointment doctor
app.patch('/api/appointments/:id/doctor', validAptId, validateBody(schemas.appointmentDoctor), async (req, res) => {
  try {
    const { doctor } = req.body;

    const existing = await Appointment.findOne({ appointmentId: req.params.id, deletedAt: null }).lean();

    const updatedApt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.id, deletedAt: null },
      { doctor },
      { new: true }
    );

    if (!updatedApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await writeAudit(req, {
      action: 'appointment.doctor',
      entity: 'Appointment',
      entityId: updatedApt.appointmentId,
      before: { doctor: existing?.doctor ?? null },
      after: { doctor }
    });

    // Send email notification for doctor assignment
    if ((transporter || fallbackTransporter) && updatedApt.email && doctor !== 'Unassigned') {
      const fromAddress = mailFrom();
          
      const mailOptions = {
        from: fromAddress,
        to: updatedApt.email,
        subject: `Doctor Assigned to Your Appointment - ${CLINIC.name}`,
        html: generateEmailHTML(
          'Doctor Assigned',
          updatedApt.patientName,
          [
            'We are pleased to inform you that a doctor has been assigned to your upcoming appointment. Please find the details below:',
            'We look forward to providing you with exceptional care. If you need to make changes, please contact us.'
          ],
          [
            { label: 'Doctor', value: doctor },
            { label: 'Date', value: updatedApt.appointmentDate },
            { label: 'Time', value: updatedApt.appointmentTime }
          ],
          null,
          doctorIcon
        )
      };
      try {
        const info = await sendEmailReliably(mailOptions);
        if (info) console.log("Doctor email sent:", info.messageId);
      } catch (err) {
        console.error("Error sending doctor email:", err);
      }
    }

    res.json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign doctor' });
  }
});

// PUT full edit appointment & patient details
app.put('/api/appointments/:id', validAptId, validateBody(schemas.updateAppointment), async (req, res) => {
  try {
    const {
      patientName,
      age,
      gender,
      phone,
      email,
      service,
      symptoms,
      doctor,
      appointmentDate,
      appointmentTime,
      status,
      address,
      medicalHistory
    } = req.body;

    const updateFields = {};
    if (patientName !== undefined) updateFields.patientName = patientName;
    if (age !== undefined) updateFields.age = age;
    if (gender !== undefined) updateFields.gender = gender;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    if (service !== undefined) updateFields.service = service;
    if (symptoms !== undefined) updateFields.symptoms = symptoms;
    if (doctor !== undefined) updateFields.doctor = doctor;
    if (appointmentDate !== undefined) updateFields.appointmentDate = appointmentDate;
    if (appointmentTime !== undefined) updateFields.appointmentTime = appointmentTime;
    if (status !== undefined) updateFields.status = status;
    if (address !== undefined) updateFields.address = address;
    if (medicalHistory !== undefined) updateFields.medicalHistory = medicalHistory;

    const existingApt = await Appointment.findOne({ appointmentId: req.params.id, deletedAt: null });
    if (!existingApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const dateChanged = appointmentDate !== undefined && appointmentDate !== existingApt.appointmentDate;
    const timeChanged = appointmentTime !== undefined && appointmentTime !== existingApt.appointmentTime;
    const doctorChanged = doctor !== undefined && doctor !== existingApt.doctor;

    const updatedApt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.id, deletedAt: null },
      { $set: updateFields },
      { new: true }
    );

    // Send email notification if date, time, or doctor was updated
    if ((dateChanged || timeChanged || doctorChanged) && (transporter || fallbackTransporter) && updatedApt.email) {
      const fromAddress = mailFrom();
        
      // These paragraphs are intentional markup, so each interpolated value is
      // escaped individually rather than relying on the template.
      const changeDescriptions = [];
      if (dateChanged) changeDescriptions.push(`<strong>Date:</strong> <s>${escapeHtml(existingApt.appointmentDate)}</s> &rarr; <strong style="color: #111827;">${escapeHtml(updatedApt.appointmentDate)}</strong>`);
      if (timeChanged) changeDescriptions.push(`<strong>Time:</strong> <s>${escapeHtml(existingApt.appointmentTime)}</s> &rarr; <strong style="color: #111827;">${escapeHtml(updatedApt.appointmentTime)}</strong>`);
      if (doctorChanged) changeDescriptions.push(`<strong>Doctor:</strong> <s>${escapeHtml(existingApt.doctor || 'Unassigned')}</s> &rarr; <strong style="color: #111827;">${escapeHtml(updatedApt.doctor)}</strong>`);
      
      const changesHtml = `<ul style="margin: 10px 0; padding-left: 20px; color: #4B5563;">` + changeDescriptions.map(c => `<li style="margin-bottom: 8px;">${c}</li>`).join('') + `</ul>`;

      const mailOptions = {
        from: fromAddress,
        to: updatedApt.email,
        subject: `Appointment Details Updated - ${CLINIC.name}`,
        html: generateEmailHTML(
          'Appointment Details Updated',
          updatedApt.patientName,
          [
            'We have updated the details of your upcoming appointment. The following changes have been made:',
            changesHtml,
            'Please review your full, updated appointment details below:',
            'If you have any questions or need to make further changes, please contact us.'
          ],
          [
            { label: 'Date', value: updatedApt.appointmentDate },
            { label: 'Time', value: updatedApt.appointmentTime },
            ...(updatedApt.doctor && updatedApt.doctor !== 'Unassigned' ? [{ label: 'Doctor', value: updatedApt.doctor }] : [])
          ],
          null,
          clockIcon
        )
      };
      
      try {
        const info = await sendEmailReliably(mailOptions);
        if (info) console.log("Update email sent:", info.messageId);
      } catch (err) {
        console.error("Error sending update email:", err);
      }
    }

    await writeAudit(req, {
      action: 'appointment.edit',
      entity: 'Appointment',
      entityId: updatedApt.appointmentId,
      // Record only the fields this request actually touched.
      before: Object.fromEntries(Object.keys(updateFields).map(k => [k, existingApt[k] ?? null])),
      after: updateFields
    });

    res.json({ success: true, appointment: updatedApt });
  } catch (err) {
    console.error("Error editing appointment:", err);
    res.status(500).json({ error: 'Failed to update appointment details' });
  }
});

// DELETE single appointment by ID — soft delete. The document is retained so a
// mistaken deletion is recoverable and the clinic keeps its treatment record.
app.delete('/api/appointments/:id', validAptId, async (req, res) => {
  try {
    const deletedAt = new Date();
    const result = await Appointment.updateOne(
      { appointmentId: req.params.id, deletedAt: null },
      { $set: { deletedAt } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    await writeAudit(req, {
      action: 'appointment.delete',
      entity: 'Appointment',
      entityId: req.params.id,
      before: { deletedAt: null },
      after: { deletedAt }
    });

    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// DELETE patient and their appointments by identifier (name, email, or phone) — soft delete
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id);
    let query;

    if (id.includes('|')) {
      const [name, contact] = id.split('|');

      query = {
        patientName: new RegExp(`^${escapeRegex(name)}$`, 'i'),
        deletedAt: null
      };

      if (contact) {
        query.$or = [
          { email: contact },
          { phone: contact }
        ];
      } else {
        query.$and = [
          { email: { $in: [null, ''] } },
          { phone: { $in: [null, ''] } }
        ];
      }
    } else {
      // Fallback for old style identifiers just in case
      query = {
        deletedAt: null,
        $or: [
          { email: id },
          { phone: id },
          { patientName: id }
        ]
      };
    }

    const deletedAt = new Date();
    const affected = await Appointment.find(query, { appointmentId: 1, _id: 0 }).lean();
    const result = await Appointment.updateMany(query, { $set: { deletedAt } });

    await writeAudit(req, {
      action: 'patient.delete',
      entity: 'Patient',
      entityId: id,
      before: { appointmentIds: affected.map(a => a.appointmentId), deletedAt: null },
      after: { deletedCount: result.modifiedCount, deletedAt }
    });

    res.json({ success: true, message: 'Patient and associated appointments deleted.', count: result.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', loginLimiter, validateBody(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!JWT_SECRET) {
      return res.status(500).json({ error: 'Server is not configured for authentication' });
    }

    const admin = await Admin.findOne({
      email: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') }
    });

    // Password comparison is constant-time via bcrypt and case-sensitive.
    const passwordOk = admin ? await bcrypt.compare(password, admin.password) : false;
    if (!admin || !passwordOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const setting = await Setting.findOne();
    if (setting && setting.maintenanceMode && admin.role !== 'Master Admin') {
      return res.status(403).json({ error: 'The dashboard is currently down for scheduled maintenance. Please try again later.' });
    }

    res.json({
      success: true,
      token: signToken(admin),
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        mustChangePassword: Boolean(admin.mustChangePassword)
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// GET /api/auth/me — validates the bearer token against live database state.
// The admin app calls this on load instead of trusting a stored flag.
app.get('/api/auth/me', async (req, res) => {
  try {
    const admin = await Admin.findOne({ id: req.user.id });
    if (!admin) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }
    res.setHeader('Cache-Control', 'no-store');
    res.json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      mustChangePassword: Boolean(admin.mustChangePassword)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load account' });
  }
});

// POST /api/auth/change-password — an authenticated admin changing their own password.
// This is the only way to clear mustChangePassword.
app.post('/api/auth/change-password', validateBody(schemas.changePassword), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 12 || newPassword.length > 128) {
      return res.status(400).json({ error: 'New password must be between 12 and 128 characters' });
    }

    const admin = await Admin.findOne({ id: req.user.id });
    if (!admin) return res.status(401).json({ error: 'Account no longer exists' });

    if (!await bcrypt.compare(currentPassword, admin.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    if (await bcrypt.compare(newPassword, admin.password)) {
      return res.status(400).json({ error: 'New password must be different from the current one' });
    }

    admin.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    admin.mustChangePassword = false;
    await admin.save();

    // Re-issue so the client gets a token minted after the change.
    res.json({ success: true, token: signToken(admin) });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// GET /api/admins
app.get('/api/admins', async (req, res) => {
  try {
    const admins = await Admin.find().select('id email role -_id').lean();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read admins' });
  }
});

// POST /api/admins
app.post('/api/admins', validateBody(schemas.createAdmin), async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 12 and 128 characters' });
    }

    const existingAdmin = await Admin.findOne({
      email: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') }
    });

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    const newAdmin = new Admin({
      id: 'ADM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      email,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: role === 'Master Admin' ? 'Master Admin' : 'Administrator',
      // A newly invited admin must replace the temporary password chosen for them.
      mustChangePassword: true
    });

    await newAdmin.save();
    
    res.status(201).json({ success: true, admin: { id: newAdmin.id, email: newAdmin.email, role: newAdmin.role } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// DELETE /api/admins/:id
app.delete('/api/admins/:id', async (req, res) => {
  try {
    if (req.params.id === 'ADM0001') {
      return res.status(403).json({ error: 'Cannot delete the primary Master Admin' });
    }
    const admin = await Admin.findOne({ id: req.params.id });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    if (admin.role === 'Master Admin') {
      return res.status(403).json({ error: 'Cannot delete a Master Admin' });
    }
    
    await Admin.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// PATCH /api/admins/:id/role
app.patch('/api/admins/:id/role', validateBody(schemas.adminRole), async (req, res) => {
  try {
    const { role } = req.body;
    if (req.params.id === 'ADM0001') {
      return res.status(403).json({ error: 'Cannot change the role of the primary Master Admin' });
    }
    
    const admin = await Admin.findOne({ id: req.params.id });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    admin.role = role;
    await admin.save();
    
    res.json({ success: true, admin: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin role' });
  }
});

// PATCH /api/admins/:id/password
app.patch('/api/admins/:id/password', validateBody(schemas.adminPassword), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 12 and 128 characters' });
    }

    const admin = await Admin.findOne({ id: req.params.id });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // A Master Admin's password can only be changed by that account itself,
    // via POST /api/auth/change-password.
    if (admin.role === 'Master Admin' || req.params.id === 'ADM0001') {
      return res.status(403).json({ error: 'Master Admin passwords can only be changed by the account holder.' });
    }

    admin.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    // The target admin must replace the password that was just set for them.
    admin.mustChangePassword = true;
    await admin.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});



// GET /api/settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Setting.findOne().lean();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(settings || { maintenanceMode: false, pauseBookings: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

// PATCH /api/settings
app.patch('/api/settings', requireMasterAdmin, validateBody(schemas.settings), async (req, res) => {
  try {
    const { maintenanceMode, pauseBookings } = req.body;
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }
    
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (pauseBookings !== undefined) settings.pauseBookings = pauseBookings;
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Service prices ---
// The price list the Analytics tab derives revenue from. A completed appointment
// copies the price in force at the time it was completed.

// GET /api/service-prices
app.get('/api/service-prices', async (req, res) => {
  try {
    const prices = await ServicePrice.find({ clinicId: CLINIC_ID })
      .select('serviceName price -_id')
      .sort({ serviceName: 1 })
      .lean();
    res.setHeader('Cache-Control', 'no-store');
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read service prices' });
  }
});

// PUT /api/service-prices — upsert one service's price
app.put('/api/service-prices', validateBody(schemas.servicePrice), async (req, res) => {
  try {
    const { serviceName, price } = req.body;

    const before = await ServicePrice.findOne({ clinicId: CLINIC_ID, serviceName }).lean();

    const saved = await ServicePrice.findOneAndUpdate(
      { clinicId: CLINIC_ID, serviceName },
      { $set: { price } },
      { new: true, upsert: true }
    );

    await writeAudit(req, {
      action: 'servicePrice.upsert',
      entity: 'ServicePrice',
      entityId: serviceName,
      before: { price: before?.price ?? null },
      after: { price: saved.price }
    });

    res.json({ success: true, servicePrice: { serviceName: saved.serviceName, price: saved.price } });
  } catch (err) {
    console.error('Failed to save service price:', err);
    res.status(500).json({ error: 'Failed to save service price' });
  }
});

// DELETE /api/service-prices/:serviceName
app.delete('/api/service-prices/:serviceName', async (req, res) => {
  try {
    const serviceName = decodeURIComponent(req.params.serviceName);
    const removed = await ServicePrice.findOneAndDelete({ clinicId: CLINIC_ID, serviceName });
    if (!removed) {
      return res.status(404).json({ error: 'Service price not found' });
    }

    await writeAudit(req, {
      action: 'servicePrice.delete',
      entity: 'ServicePrice',
      entityId: serviceName,
      before: { price: removed.price },
      after: null
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete service price' });
  }
});

// GET /api/audit-log — most recent entries first. Master Admin only.
app.get('/api/audit-log', requireMasterAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const entries = await AuditLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    res.setHeader('Cache-Control', 'no-store');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read audit log' });
  }
});

// GET /api/doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-_id -__v').lean();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read doctors' });
  }
});

// POST /api/doctors
app.post('/api/doctors', validateBody(schemas.doctor), async (req, res) => {
  try {
    const { name, specialization, status, phone, email } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ error: 'Name and specialization are required' });
    }
    
    const newDoctor = new Doctor({
      id: 'DOC' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      name,
      specialization,
      status: status || 'Available',
      phone: phone || '',
      email: email || ''
    });
    
    await newDoctor.save();
    
    const responseDoc = {
      id: newDoctor.id, name: newDoctor.name, specialization: newDoctor.specialization,
      status: newDoctor.status, phone: newDoctor.phone, email: newDoctor.email
    };
    
    res.status(201).json({ success: true, doctor: responseDoc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add doctor' });
  }
});

// PATCH /api/doctors/:id
app.patch('/api/doctors/:id', validateBody(schemas.doctorUpdate), async (req, res) => {
  try {
    const updates = req.body;
    
    const doctor = await Doctor.findOneAndUpdate(
      { id: req.params.id },
      updates,
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const responseDoc = {
      id: doctor.id, name: doctor.name, specialization: doctor.specialization,
      status: doctor.status, phone: doctor.phone, email: doctor.email
    };
    
    res.json({ success: true, doctor: responseDoc });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// DELETE /api/doctors/:id
app.delete('/api/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ id: req.params.id });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// Serve static files from the dental website
app.use(express.static(path.join(__dirname, '../ZEMORA DENTAL'), {
  maxAge: 0,
  setHeaders: (res, reqPath) => {
    if (reqPath.match(/\.(html|css|js)$/)) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
  }
}));

// Fallback for Admin SPA routing
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../ZEMORA DENTAL/admin/index.html'));
});

// --- TEMPORARY INBOUND EMAIL SYSTEM FOR GOOGLE VERIFICATION ---
// This is a provider webhook, so it cannot carry an admin JWT. It is instead gated
// on a shared secret. Set INBOUND_WEBHOOK_SECRET and configure the mail provider to
// send it as ?secret=... or an X-Webhook-Secret header.
app.post('/api/inbound', express.json(), async (req, res) => {
  const expected = process.env.INBOUND_WEBHOOK_SECRET;
  if (expected) {
    const supplied = req.get('X-Webhook-Secret') || req.query.secret || '';
    if (supplied !== expected) {
      console.warn('Rejected inbound webhook: bad or missing secret.');
      return res.status(401).send('Unauthorized');
    }
  }
  console.log("INBOUND EMAIL RECEIVED");
  try {
    const textContent = req.body.text || JSON.stringify(req.body);
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('inbound_emails').insertOne({
        content: textContent,
        createdAt: new Date()
      });
      console.log("Saved email content to MongoDB!");
    } else {
      console.error("Database connection not ready yet");
    }
  } catch (error) {
    console.error("Error parsing inbound email", error);
  }
  res.status(200).send('OK');
});

app.get('/api/read-email', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.send("Database connection is waking up... refresh in a few seconds!");
    }
    const latestEmail = await db.collection('inbound_emails').findOne({}, { sort: { createdAt: -1 } });
      
    const displayContent = latestEmail ? latestEmail.content : "No emails received yet. Waiting for Google...";
    
    res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h2>Latest Received Email:</h2>
          <pre style="background: #f4f4f4; padding: 1rem; border-radius: 8px; white-space: pre-wrap; word-break: break-all;">${escapeHtml(displayContent)}</pre>
          <br/>
          <button onclick="window.location.reload()">Refresh Page</button>
        </body>
      </html>
    `);
  } catch (err) {
    res.send("Database connection error or still starting up... refresh again!");
  }
});
// -----------------------------------------------------------

// Sentry's Express error handler must be registered after every route so it sees
// unhandled errors from all of them. Inert when SENTRY_DSN is unset.
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Last-resort error handler. Without this, an unhandled throw returns Express's
// default HTML stack trace, which leaks file paths and internals.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for Vercel Serverless Functions
module.exports = app;
