const html = require('fs').readFileSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html', 'utf8'); 
const idx = html.indexOf('Book Appointment');
const sub = html.substring(idx - 1000, idx + 1500);
console.log(sub);
