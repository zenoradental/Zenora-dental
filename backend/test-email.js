const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'whitefoxofficial.ai@gmail.com', pass: 'jwrzajxfprqoecnv' }
});
transporter.sendMail({
  from: '"Zenora Dental <whitefoxofficial.ai@gmail.com>"',
  to: 'whitefoxofficial.ai@gmail.com',
  subject: 'Test Quotes',
  text: 'test'
}, (err, info) => {
  if (err) console.error('ERROR:', err);
  else console.log('SUCCESS:', info.messageId);
});
