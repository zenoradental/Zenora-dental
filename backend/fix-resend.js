const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /const fromAddress = process\.env\.SMTP_USER === 'resend'[\s\S]*?\:\s*\(process\.env\.SMTP_FROM_EMAIL \|\| '"Zenora Dental" <noreply@zenoradental\.com>'\);/g;
code = code.replace(regex, 'const fromAddress = process.env.SMTP_FROM_EMAIL || \'"Zenora Dental" <noreply@zenoradental.com>\';');

fs.writeFileSync('server.js', code);
console.log('Fixed fromAddress logic!');
