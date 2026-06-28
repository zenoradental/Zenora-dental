require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const nodemailer = require('nodemailer');

// Use PNG icons from a reliable CDN because Gmail blocks inline SVGs
const calendarIcon = `<img src="https://img.icons8.com/ios/50/475569/calendar--v1.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;

const generateEmailHTML = (title, patientName, paragraphs, highlights, cta, heroImageUrl, postHighlightsParagraphs = []) => {
  const imageUrl = heroImageUrl || 'https://zenoradentalofficial.vercel.app/assets/img/gen_about-hero-image.jpg';
  
  // If the passed imageUrl contains an img tag, it means we are using Option 5C iconography instead of a hero image
  const isIcon = imageUrl.trim().startsWith('<img');
  
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
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 2px;">
              ${!isIcon ? `
              <tr>
                <td>
                  <img src="${imageUrl}" alt="Zenora Dental Clinic" style="display: block; width: 100%; height: 250px; object-fit: cover;" />
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="margin: 0; font-family: -apple-system, sans-serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #111827; text-transform: uppercase;">
                    Zenora Dental
                  </h1>
                  <div style="margin: 15px auto 25px auto; width: 40px; height: 1px; background-color: #E5E7EB;"></div>
                  
                  ${isIcon ? `
                  <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto; margin-bottom: 20px;">
                    <tr>
                      <td align="center" valign="middle" style="width: 48px; height: 48px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%;">
                        ${imageUrl}
                      </td>
                    </tr>
                  </table>
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
                          <td style="padding: 10px 0; ${i !== highlights.length - 1 ? 'border-bottom: 1px solid #E2E8F0;' : ''} color: #64748B; font-size: 14px; width: 40%; font-weight: 500;">
                            ${h.label}
                          </td>
                          <td style="padding: 10px 0; ${i !== highlights.length - 1 ? 'border-bottom: 1px solid #E2E8F0;' : ''} color: #0F172A; font-size: 15px; font-weight: 600; text-align: right;">
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

const runTest = async () => {
  const transporter = nodemailer.createTransport({
    host: '142.250.111.108',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      servername: 'smtp.gmail.com',
      rejectUnauthorized: false
    }
  });

  const fromAddress = process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>';
  
  const mailOptions = {
    from: fromAddress,
    to: process.env.SMTP_USER,
    subject: `Appointment Confirmed - Testing PNG Icon`,
    text: `Appointment Confirmed! Thank you, Test User.`,
    html: generateEmailHTML(
      'Appointment Confirmed',
      'Jane Doe',
      [
        'We are writing to confirm that your appointment request has been successfully received by our administration team. At <strong>Zenora Dental</strong>, your oral health and comfort are our top priorities, and we look forward to providing you with exceptional care.',
        'Please ensure you arrive 10 minutes prior to your scheduled time. If you have any questions or need to reschedule, please contact our support team.'
      ],
      [
        { label: 'Tracking ID', value: 'TEST-PNG' },
        { label: 'Date', value: 'December 1st, 2026' },
        { label: 'Time', value: '10:00 AM' },
        { label: 'Service', value: 'General Checkup' }
      ],
      { text: 'Check Appointment Status', url: 'https://zenoradentalofficial.vercel.app/check-status.html' },
      calendarIcon
    )
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("SUCCESS! Test email sent with PNG to", process.env.SMTP_USER);
  } catch (err) {
    console.error("Error sending email: ", err);
  }
};

runTest();
