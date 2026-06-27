const fs = require('fs');
let c = fs.readFileSync('book-appointment.html', 'utf8');
if (c.startsWith('"')) {
   c = JSON.parse(c);
   fs.writeFileSync('book-appointment.html', c);
}
