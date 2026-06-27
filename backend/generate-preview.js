const fs = require('fs');

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

const buildPreview = () => {
  const calendarIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const doctorIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;

  // 1. Appointment Confirmed
  const aptConfirmedHtml = generateEmailHTML(
    'Appointment Confirmed',
    'John Doe',
    [
      'We are writing to confirm that your appointment request has been successfully received by our administration team. At <strong>Zenora Dental</strong>, your oral health and comfort are our top priorities, and we look forward to providing you with exceptional care.',
      'Please ensure you arrive 10 minutes prior to your scheduled time. If you have any questions or need to reschedule, please contact our support team.'
    ],
    [
      { label: 'Tracking ID', value: 'APT1024' },
      { label: 'Date', value: '2026-07-01' },
      { label: 'Time', value: '10:00 AM' },
      { label: 'Service', value: 'General Checkup' }
    ],
    { text: 'Check Appointment Status', url: '#' },
    calendarIcon
  );

  // 2. Doctor Assigned
  const doctorAssignedHtml = generateEmailHTML(
    'Doctor Assigned',
    'John Doe',
    [
      'We are pleased to inform you that a doctor has been assigned to your upcoming appointment. Please find the details below:'
    ],
    [
      { label: 'Doctor', value: 'Dr. Sarah Smith' },
      { label: 'Date', value: '2026-07-01' },
      { label: 'Time', value: '10:00 AM' }
    ],
    null,
    doctorIcon,
    [
      'Your assigned specialist has reviewed your preliminary details and is fully prepared for your visit. Our clinical team is dedicated to providing you with the highest standard of personalized dental care.',
      'We look forward to providing you with exceptional care. If you need to make any changes to this appointment, please contact us at your earliest convenience.'
    ]
  );

  // 3. Status Update (General)
  const statusUpdateHtml = generateEmailHTML(
    'Appointment Status Update',
    'John Doe',
    [
      'Your appointment status has been updated. Please find the details of your appointment below:',
      'If you have any questions or require further assistance, please do not hesitate to contact our support team.'
    ],
    [
      { label: 'Status', value: 'Confirmed' },
      { label: 'Date', value: '2026-07-01' },
      { label: 'Time', value: '10:00 AM' },
      { label: 'Doctor', value: 'Dr. Sarah Smith' }
    ],
    null,
    `<img src="https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-clock.png" alt="Clock" style="width: 24px; height: 24px; display: block; border: 0;" />`
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
    null,
    { text: 'Review on Google', url: '#' },
    `<img src="https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-tooth.png" alt="Tooth" style="width: 24px; height: 24px; display: block; border: 0;" />`
  );

  const fullHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Email Previews</title>
    <style>
      body { background-color: #E5E7EB; margin: 0; padding: 40px; font-family: sans-serif; }
      h1 { text-align: center; margin-bottom: 40px; color: #111827; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(600px, 1fr)); gap: 40px; max-width: 1400px; margin: 0 auto; }
      .email-container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
      .email-container h2 { text-align: center; color: #4338ca; font-size: 18px; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #eef2ff; padding-bottom: 10px; }
    </style>
  </head>
  <body>
    <h1>All 4 Email Previews (Context-Specific Images)</h1>
    <div class="grid">
      <div class="email-container"><h2>1. Appointment Confirmed</h2>${aptConfirmedHtml}</div>
      <div class="email-container"><h2>2. Doctor Assigned</h2>${doctorAssignedHtml}</div>
      <div class="email-container"><h2>3. Status Update</h2>${statusUpdateHtml}</div>
      <div class="email-container"><h2>4. Google Review (Completed)</h2>${reviewHtml}</div>
    </div>
  </body>
  </html>
  `;

  fs.writeFileSync('preview-all.html', fullHtml);
  console.log('Successfully generated preview-all.html');
};

buildPreview();
