const fs = require('fs');

let code = fs.readFileSync('send-all-tests.js', 'utf8');

const calendarIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const doctorIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;

code = code.replace(/const calendarIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const calendarIcon = `' + calendarIcon + '`;');
code = code.replace(/const doctorIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const doctorIcon = `' + doctorIcon + '`;');

fs.writeFileSync('send-all-tests.js', code);
console.log('Fixed send-all-tests.js icons');
