// Build deploy trigger v2026.06.28
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const dns = require('dns');
try { dns.setDefaultResultOrder('ipv4first'); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const { waitUntil } = require('@vercel/functions');


const app = express();
app.use(cors());
app.use(express.json());

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
      tls: isResend ? { lookup: ipv4Lookup } : { servername: host, rejectUnauthorized: false, lookup: ipv4Lookup }
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
      tls: isResend ? { lookup: ipv4Lookup } : { servername: host, rejectUnauthorized: false, lookup: ipv4Lookup }
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
  const resendKey = process.env.RESEND_API_KEY || 're_Nm7WdJmB_LvaosxniMMfzzFKu8CJmQ5tS';
  
  if (resendKey) {
    try {
      const recipientList = Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to];
      const payload = {
        from: 'Zenora Dental <onboarding@resend.dev>',
        to: recipientList,
        subject: mailOptions.subject || 'Zenora Dental Notification',
        html: mailOptions.html || mailOptions.text || '<p>Notification from Zenora Dental</p>'
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.id) {
        console.log('Email sent successfully via Resend HTTP API (HTTPS Port 443): %s', data.id);
        return { messageId: data.id };
      } else {
        console.warn('Resend HTTP API returned warning/error:', JSON.stringify(data));
        // If unverified domain error (403), forward alert to zenoradental@gmail.com so clinic is notified!
        if (data.name === 'validation_error' && !recipientList.includes('zenoradental@gmail.com')) {
          console.log('Forwarding booking email alert to verified clinic inbox (zenoradental@gmail.com)...');
          payload.to = ['zenoradental@gmail.com'];
          payload.subject = `[PATIENT ALERT: ${mailOptions.to}] ` + payload.subject;
          const retryResp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const retryData = await retryResp.json();
          if (retryResp.ok && retryData.id) {
            console.log('Alert forwarded successfully to zenoradental@gmail.com: %s', retryData.id);
            return { messageId: retryData.id };
          }
        }
      }
    } catch (resendErr) {
      console.error('Resend HTTP dispatch failed, falling back to SMTP...', resendErr.message || resendErr);
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



const calendarIcon = `<img src="https://zenoradentalofficial.netlify.app/assets/img/gen_icon-calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const doctorIcon = `<img src="https://zenoradentalofficial.netlify.app/assets/img/gen_icon-user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const clockIcon = `<img src="https://zenoradentalofficial.netlify.app/assets/img/gen_icon-clock.png" alt="Clock" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const toothIcon = `<img src="https://zenoradentalofficial.netlify.app/assets/img/gen_icon-tooth.png" alt="Tooth" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const infoIcon = `<img src="https://zenoradentalofficial.netlify.app/assets/img/gen_icon-info.png" alt="Info" style="width: 24px; height: 24px; display: block; border: 0;" />`;

const generateEmailHTML = (title, patientName, paragraphs, highlights, cta, iconSvg, postHighlightsParagraphs = []) => {
  const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`;
  const icon = iconSvg || defaultIcon;

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
                    Zenora Dental
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
                    ${title}
                  </h2>
                  <div style="text-align: left; margin-bottom: 30px;">
                    <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">
                      Dear <strong style="color: #111827; font-weight: 500;">${patientName}</strong>,
                    </p>
                    ${paragraphs && paragraphs.length > 0 ? paragraphs.map(p => `<p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">${p}</p>`).join('') : ''}
                  </div>
                  ${highlights && highlights.length > 0 ? `
                  <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px 25px; margin-bottom: 30px; text-align: left;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${highlights.map((h, i) => `
                        <tr>
                          <td style="padding: 10px 0; ${i !== highlights.length - 1 ? 'border-bottom: 1px solid #F1F5F9;' : ''} color: #64748B; font-size: 14px; width: 40%; font-weight: 500;">
                            ${h.label}
                          </td>
                          <td style="padding: 10px 0; ${i !== highlights.length - 1 ? 'border-bottom: 1px solid #F1F5F9;' : ''} color: #0F172A; font-size: 15px; font-weight: 600; text-align: right;">
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
                  ${cta ? `
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <a href="${cta.url}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 18px 40px; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 4px;">
                          ${cta.text}
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
                  <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.8;">
                    <strong>Contact Us</strong><br>
                    📞 +91 98765 43210<br>
                    ✉️ hello@zenoradental.com
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color: #FAFAFA; padding: 30px; text-align: center; border-top: 1px solid #F3F4F6;">
                  <p style="margin: 0 0 10px 0; font-size: 11px; color: #9CA3AF; letter-spacing: 1px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} Zenora Dental
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
    if (transporter) await transporter.verify();
    
    // Attempt to send a test email
    const fromAddress = process.env.SMTP_USER === 'resend' 
        ? 'onboarding@resend.dev' 
        : (process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>');
        
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
  role: { type: String, default: 'Administrator' }
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
  address: String,
  medicalHistory: String,
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Database Initialization
const initializeDb = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({ id: 'ADM0001', email: 'admin@zenoradental.com', password: 'zenoradental2010', role: 'Master Admin' });
      console.log('Default Master Admin created.');
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


// Generate a sequential ID based on existing appointments
const generateId = async () => {
  const latestApt = await Appointment.findOne().sort({ createdAt: -1 });
  let maxId = 1000;
  
  if (latestApt && latestApt.appointmentId && latestApt.appointmentId.startsWith('APT')) {
    const numStr = latestApt.appointmentId.substring(3);
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      maxId = num;
    }
  }
  
  const nextId = maxId + 1;
  return 'APT' + nextId.toString().padStart(4, '0');
}

// GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1, _id: -1 }).lean();
    res.json(appointments);
  } catch (err) {
    console.error('Failed to read appointments:', err);
    res.status(500).json({ error: 'Failed to read appointments', details: err.message });
  }
});

// GET a single appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ appointmentId: req.params.id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read appointments' });
  }
});

// POST a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (setting && setting.pauseBookings) {
      return res.status(403).json({ error: 'We are temporarily not accepting new appointments.' });
    }

    const newApt = req.body;
    
    // Check if slot is booked
    const isBooked = await Appointment.exists({
      appointmentDate: newApt.date,
      appointmentTime: newApt.time,
      status: { $ne: 'Cancelled' }
    });

    if (isBooked) {
      return res.status(400).json({ error: 'This time slot is already booked by another patient. Please choose a different date or time.' });
    }
    
    const nextAptId = await generateId();

    const appointmentRecord = new Appointment({
      appointmentId: nextAptId,
      patientName: newApt.name || 'Unknown',
      age: newApt.age ? parseInt(newApt.age) : 30,
      gender: newApt.gender || 'Not specified',
      phone: newApt.phone || '',
      email: newApt.email || '',
      service: newApt.service || 'General Checkup',
      symptoms: newApt.notes || 'No notes provided',
      doctor: 'Unassigned',
      appointmentDate: newApt.date || '',
      appointmentTime: newApt.time || '',
      status: 'Pending',
      address: 'Not provided',
      medicalHistory: newApt.medicalHistory || 'Not provided',
      createdAt: new Date()
    });
    
    await appointmentRecord.save();
    
    // Return instant response so the user never waits on email timeouts!
    res.status(201).json({ success: true, appointment: appointmentRecord });

    // Send email notification non-blockingly in the background
    if ((transporter || fallbackTransporter) && appointmentRecord.email) {
      const fromAddress = process.env.SMTP_USER === 'resend' 
        ? 'onboarding@resend.dev' 
        : (process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>');
        
      const mailOptions = {
        from: fromAddress,
        to: appointmentRecord.email,
        subject: `Appointment Confirmed - Tracking ID: ${appointmentRecord.appointmentId}`,
        text: `Appointment Confirmed! Thank you, ${appointmentRecord.patientName}. Your Tracking ID is ${appointmentRecord.appointmentId}. Service: ${appointmentRecord.service || 'General Checkup'}. Date: ${appointmentRecord.appointmentDate}. Time: ${appointmentRecord.appointmentTime}. Please ensure you arrive 10 minutes prior to your scheduled time.`,
        html: generateEmailHTML(
          'Appointment Confirmed',
          appointmentRecord.patientName,
          [
            'We are writing to confirm that your appointment request has been successfully received by our administration team. At <strong>Zenora Dental</strong>, your oral health and comfort are our top priorities, and we look forward to providing you with exceptional care.',
            'Please ensure you arrive 10 minutes prior to your scheduled time. If you have any questions or need to reschedule, please contact our support team.'
          ],
          [
            { label: 'Tracking ID', value: appointmentRecord.appointmentId },
            { label: 'Date', value: appointmentRecord.appointmentDate },
            { label: 'Time', value: appointmentRecord.appointmentTime },
            { label: 'Service', value: appointmentRecord.service || 'General Checkup' }
          ],
          { text: 'Check Appointment Status', url: `${process.env.FRONTEND_URL || 'https://zenoradentalofficial.netlify.app'}/check-status.html` },
          calendarIcon
        )
      };

      sendEmailReliably(mailOptions)
        .then(info => { if (info) console.log("Email sent: %s", info.messageId); })
        .catch(emailErr => console.error("Non-fatal background error sending confirmation email:", emailErr.message || emailErr));
    }
  } catch (err) {
    console.error("Fatal error saving appointment:", err);
    res.status(500).json({ error: 'Failed to save appointment', details: err.message });
  }
});

// PATCH update appointment status
app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedApt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.id }, 
      { status }, 
      { new: true }
    );
    
    if (!updatedApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Send email notification for status change
    if ((transporter || fallbackTransporter) && updatedApt.email) {
      const fromAddress = process.env.SMTP_USER === 'resend' 
        ? 'onboarding@resend.dev' 
        : (process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>');
        
      let subject = `Appointment Status Updated - Zenora Dental`;
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
        subject = `Thank you for visiting Zenora Dental!`;
        htmlBody = generateEmailHTML(
          'Thank you for visiting Zenora Dental.',
          updatedApt.patientName,
          [
            'It was a privilege to welcome you to our clinic today. We are deeply committed to providing state-of-the-art dental care in a comfortable, welcoming environment, and we sincerely hope that your experience reflected our highest standards. Your oral health and satisfaction are our absolute top priorities.',
            'As a growing practice, the trust and feedback of our patients are vital to our success. If you are satisfied with the care you received, we would be incredibly grateful if you could take a brief moment to share your experience on Google.',
            'Your insights not only help us continually improve, but they also guide others in our community who are seeking reliable, high-quality dental care.'
          ],
          null, // No highlights needed here
          { text: 'Review on Google', url: 'https://g.page/review/placeholder-link' },
          toothIcon
        );
      }

      const mailOptions = {
        from: fromAddress,
        to: updatedApt.email,
        subject: subject,
        html: htmlBody
      };
      sendEmailReliably(mailOptions)
        .then(info => { if (info) console.log("Status email sent:", info.messageId); })
        .catch(err => console.error("Error sending status email:", err));
    }

    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// PATCH update appointment doctor
app.patch('/api/appointments/:id/doctor', async (req, res) => {
  try {
    const { doctor } = req.body;
    
    const updatedApt = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.id },
      { doctor },
      { new: true }
    );
    
    if (!updatedApt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Send email notification for doctor assignment
    if ((transporter || fallbackTransporter) && updatedApt.email && doctor !== 'Unassigned') {
      const fromAddress = process.env.SMTP_USER === 'resend' 
        ? 'onboarding@resend.dev' 
        : (process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>');
          
      const mailOptions = {
        from: fromAddress,
        to: updatedApt.email,
        subject: `Doctor Assigned to Your Appointment - Zenora Dental`,
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
      sendEmailReliably(mailOptions)
        .then(info => { if (info) console.log("Doctor email sent:", info.messageId); })
        .catch(err => console.error("Error sending doctor email:", err));
    }

    res.json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign doctor' });
  }
});

// DELETE all appointments
app.delete('/api/appointments', async (req, res) => {
  try {
    await Appointment.deleteMany({});
    res.json({ success: true, message: 'All appointments cleared.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to clear appointments' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email, password });
    if (admin) {
      const setting = await Setting.findOne();
      
      if (setting && setting.maintenanceMode && admin.role !== 'Master Admin') {
        return res.status(403).json({ error: 'The dashboard is currently down for scheduled maintenance. Please try again later.' });
      }

      res.json({ success: true, user: { id: admin.id, email: admin.email, role: admin.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to authenticate' });
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
app.post('/api/admins', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }
    
    const newAdmin = new Admin({
      id: 'ADM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      email,
      password,
      role: role || 'Administrator'
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
app.patch('/api/admins/:id/role', async (req, res) => {
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
app.patch('/api/admins/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    const admin = await Admin.findOne({ id: req.params.id });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    if (admin.role === 'Master Admin' || req.params.id === 'ADM0001') {
      return res.status(403).json({ error: 'Standard users cannot change the password for Master Admin accounts.' });
    }
    
    admin.password = password;
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
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.json(settings || { maintenanceMode: false, pauseBookings: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

// PATCH /api/settings
app.patch('/api/settings', async (req, res) => {
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

// GET /api/doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-_id -__v').lean();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read doctors' });
  }
});

// POST /api/doctors
app.post('/api/doctors', async (req, res) => {
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
app.patch('/api/doctors/:id', async (req, res) => {
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
  maxAge: '1d', // Cache static assets for 1 day
  setHeaders: (res, reqPath) => {
    if (reqPath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Fallback for Admin SPA routing
app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../ZEMORA DENTAL/admin/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

// Export the app for Vercel Serverless Functions
module.exports = app;
