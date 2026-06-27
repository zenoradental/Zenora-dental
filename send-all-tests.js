require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const nodemailer = require('nodemailer');
const fs = require('fs');

const serverCode = fs.readFileSync('server.js', 'utf8');
const generateEmailHTMLRegex = /const generateEmailHTML = [\s\S]*?\n};\r?\n/m;
const match = serverCode.match(generateEmailHTMLRegex);

const evalCode = match[0].replace('const generateEmailHTML =', 'global.generateEmailHTML =');
eval(evalCode);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_USER === 'resend' ? 'smtp.resend.com' : (process.env.SMTP_HOST || 'smtp.gmail.com'),
  port: process.env.SMTP_USER === 'resend' ? 465 : (process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_USER === 'resend' ? true : (process.env.SMTP_PORT == 465),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const twilio = require('twilio');
let twilioClient = null;
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio Sandbox Number
const testPhoneNumber = process.env.TEST_WHATSAPP_NUMBER; // Optional: Provide a number in .env to test WhatsApp

if (twilioSid && twilioAuthToken) {
  twilioClient = twilio(twilioSid, twilioAuthToken);
}

const sendWhatsAppTest = async (to, msg) => {
  if (!twilioClient || !to) return;
  try {
    let formattedNumber = to.replace(/[^0-9+]/g, '');
    if (formattedNumber.length === 10) formattedNumber = '+91' + formattedNumber;
    else if (!formattedNumber.startsWith('+')) formattedNumber = '+' + formattedNumber;
    
    await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: `whatsapp:${formattedNumber}`,
      body: msg
    });
    console.log(`WhatsApp message sent to ${formattedNumber}`);
  } catch (err) {
    console.error(`Failed to send WhatsApp message:`, err.message);
  }
};

const sendEmails = async () => {
  const fromAddress = process.env.SMTP_USER === 'resend' 
    ? 'onboarding@resend.dev' 
    : (process.env.SMTP_FROM_EMAIL || '"Zenora Dental" <noreply@zenoradental.com>');
    
  const toAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'rockerm2010@gmail.com';
  
  const calendarIcon = `<img src="https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const doctorIcon = `<img src="https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const clockIcon = `<img src="https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-clock.png" alt="Clock" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const toothIcon = `<img src="https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-tooth.png" alt="Tooth" style="width: 24px; height: 24px; display: block; border: 0;" />`;

  const html1 = global.generateEmailHTML(
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

  const html2 = global.generateEmailHTML(
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

  const html3 = global.generateEmailHTML(
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
    clockIcon
  );

  const html4 = global.generateEmailHTML(
    'Thank you for visiting Zenora Dental.',
    'John Doe',
    [
      'It was a privilege to welcome you to our clinic today. We are deeply committed to providing state-of-the-art dental care in a comfortable, welcoming environment, and we sincerely hope that your experience reflected our highest standards. Your oral health and satisfaction are our absolute top priorities.',
      'As a growing practice, the trust and feedback of our patients are vital to our success. If you are satisfied with the care you received, we would be incredibly grateful if you could take a brief moment to share your experience on Google.',
      'Your insights not only help us continually improve, but they also guide others in our community who are seeking reliable, high-quality dental care.'
    ],
    null,
    { text: 'REVIEW ON GOOGLE', url: 'https://g.page/r/zenoradental/review' },
    toothIcon
  );

  console.log(`Sending to ${toAddress}...`);
  
  await transporter.sendMail({ from: fromAddress, to: toAddress, subject: '[Test 1] Appointment Confirmed', html: html1 });
  await transporter.sendMail({ from: fromAddress, to: toAddress, subject: '[Test 2] Doctor Assigned', html: html2 });
  await transporter.sendMail({ from: fromAddress, to: toAddress, subject: '[Test 3] Appointment Status Update', html: html3 });
  await transporter.sendMail({ from: fromAddress, to: toAddress, subject: '[Test 4] Thank you for visiting Zenora Dental', html: html4 });
  
  console.log('All 4 test emails sent successfully!');

  if (testPhoneNumber && twilioClient) {
    console.log(`Sending test WhatsApp message to ${testPhoneNumber}...`);
    await sendWhatsAppTest(testPhoneNumber, 'Hello from Zenora Dental! This is a test WhatsApp message to verify the Twilio integration.');
    console.log('WhatsApp test completed.');
  } else if (!twilioClient) {
    console.log('Twilio credentials not found in .env. Skipping WhatsApp test.');
  } else {
    console.log('Twilio credentials found, but no TEST_WHATSAPP_NUMBER set in .env. Skipping WhatsApp test.');
  }
};

sendEmails().catch(console.error);
