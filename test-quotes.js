const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'whitefoxofficial.ai@gmail.com', pass: 'jwrzajxfprqoecnv' }
});

const fromString = '"Zenora Dental <whitefoxofficial.ai@gmail.com>"';

transporter.sendMail({
  from: fromString,
  to: 'whitefoxofficial.ai@gmail.com',
  subject: 'Test Quotes',
  text: 'test'
}, (err, info) => {
  if (err) console.error('ERROR:', err);
  else console.log('SUCCESS:', info.messageId);
});
