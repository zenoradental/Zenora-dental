require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const nodemailer = require('nodemailer');

const testEmail = process.env.SMTP_USER === 'resend' ? process.env.SMTP_FROM_EMAIL : process.env.SMTP_USER;
const fromAddress = process.env.SMTP_USER === 'resend' 
  ? 'onboarding@resend.dev' 
  : (process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_USER === 'resend' ? 'smtp.resend.com' : (process.env.SMTP_HOST || 'smtp.gmail.com'),
  port: process.env.SMTP_USER === 'resend' ? 465 : (process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_USER === 'resend' ? true : (process.env.SMTP_PORT == 465),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: process.env.SMTP_USER === 'resend' ? {} : {
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false
  }
});

const generateEmailHTML = (title, patientName, paragraphs, cta) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6; padding: 50px 15px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 2px;">
            <tr>
              <td>
                <img src="https://zenoradentalofficial.vercel.app/assets/img/gen_about-hero-image.jpg" alt="Zenora Dental Clinic" style="display: block; width: 100%; height: 250px; object-fit: cover;" />
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px 20px 40px; text-align: center;">
                <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; font-weight: 600; letter-spacing: 2px; color: #111827; text-transform: uppercase;">
                  Zenora Dental
                </h1>
                <div style="margin: 15px auto 0 auto; width: 40px; height: 1px; background-color: #D1D5DB;"></div>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 50px 40px 50px; text-align: center;">
                <h2 style="margin: 0 0 25px 0; font-size: 18px; font-weight: 500; color: #374151; letter-spacing: 0.5px;">
                  ${title}
                </h2>
                <div style="text-align: left; margin-bottom: 30px;">
                  <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">
                    Dear <strong style="color: #111827; font-weight: 500;">${patientName}</strong>,
                  </p>
                  ${paragraphs.map(p => `<p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.8; color: #4B5563; font-weight: 300;">${p}</p>`).join('')}
                </div>
                ${cta ? `
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <a href="${cta.url}" target="_blank" style="display: inline-block; background-color: #111827; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 18px 40px; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 2px;">
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
                <div style="margin: 20px auto; width: 60px; height: 1px; background-color: #E5E7EB;"></div>
                <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.8;">
                  <strong>Contact Us</strong><br>
                  📞 +91 98765 43210<br>
                  ✉️ hello@zenoradental.com
                </p>
                <p style="margin: 15px 0 0 0; font-size: 13px; color: #6B7280;">
                  Follow us on <a href="#" style="color: #111827; text-decoration: none; font-weight: 500;">Instagram</a> &amp; <a href="#" style="color: #111827; text-decoration: none; font-weight: 500;">Facebook</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #FAFAFA; padding: 30px; text-align: center; border-top: 1px solid #F3F4F6;">
                <p style="margin: 0 0 10px 0; font-size: 11px; color: #9CA3AF; letter-spacing: 1px; text-transform: uppercase;">
                  &copy; ${new Date().getFullYear()} Zenora Dental
                </p>
                <p style="margin: 0; font-size: 11px; color: #D1D5DB;">
                  Excellence in Dentistry
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const sendTestEmails = async () => {
  console.log('Sending test emails to:', testEmail);

  // 1. Appointment Confirmed
  const aptConfirmedHtml = generateEmailHTML(
    'Appointment Confirmed',
    'John Doe',
    [
      'We are writing to confirm that your appointment request has been successfully received by our administration team. At <strong>Zenora Dental</strong>, your oral health and comfort are our top priorities, and we look forward to providing you with exceptional care.',
      '<strong>Tracking ID:</strong> APT1024<br><strong>Date:</strong> 2026-07-01<br><strong>Time:</strong> 10:00 AM<br><strong>Service:</strong> General Checkup',
      'Please ensure you arrive 10 minutes prior to your scheduled time. If you have any questions or need to reschedule, please contact our support team.'
    ],
    { text: 'Check Appointment Status', url: 'https://zenoradentalofficial.vercel.app/check-status.html' }
  );

  // 2. Doctor Assigned
  const doctorAssignedHtml = generateEmailHTML(
    'Doctor Assigned',
    'John Doe',
    [
      'We are pleased to inform you that <strong>Dr. Sarah Smith</strong> has been assigned to your upcoming appointment.',
      '<strong>Date:</strong> 2026-07-01<br><strong>Time:</strong> 10:00 AM',
      'We look forward to providing you with exceptional care. If you need to make changes, please contact us.'
    ]
  );

  // 3. Status Update (General)
  const statusUpdateHtml = generateEmailHTML(
    'Appointment Status Update',
    'John Doe',
    [
      'Your appointment status has been updated to: <strong>Confirmed</strong>.',
      '<strong>Date:</strong> 2026-07-01<br><strong>Time:</strong> 10:00 AM<br><strong>Doctor:</strong> Dr. Sarah Smith',
      'If you have any questions or require further assistance, please do not hesitate to contact our support team.'
    ]
  );

  // 4. Completed / Review Email
  const reviewHtml = generateEmailHTML(
    'Thank you for visiting Zenora Dental.',
    'John Doe',
    [
      'It was a privilege to welcome you to our clinic today. We are deeply committed to providing state-of-the-art dental care in a comfortable, welcoming environment, and we sincerely hope that your experience reflected our highest standards. Your oral health and satisfaction are our absolute top priorities.',
      'As a growing practice, the trust and feedback of our patients are vital to our success. If you are satisfied with the care you received, we would be incredibly grateful if you could take a brief moment to share your experience on Google.',
      'Your insights not only help us continually improve, but they also guide others in our community who are seeking reliable, high-quality dental care.'
    ],
    { text: 'Review on Google', url: 'https://g.page/review/placeholder-link' }
  );

  try {
    console.log('Sending: Appointment Confirmed...');
    await transporter.sendMail({ from: fromAddress, to: testEmail, subject: '1. Appointment Confirmed (Test)', html: aptConfirmedHtml });
    
    console.log('Sending: Doctor Assigned...');
    await transporter.sendMail({ from: fromAddress, to: testEmail, subject: '2. Doctor Assigned (Test)', html: doctorAssignedHtml });
    
    console.log('Sending: Status Update...');
    await transporter.sendMail({ from: fromAddress, to: testEmail, subject: '3. Status Update (Test)', html: statusUpdateHtml });

    console.log('Sending: Completed Review Email...');
    await transporter.sendMail({ from: fromAddress, to: testEmail, subject: '4. Google Review Email (Test)', html: reviewHtml });
    
    console.log('🎉 All test emails successfully sent to', testEmail);
  } catch (err) {
    console.error('Error sending test emails:', err);
  }
};

sendTestEmails();
