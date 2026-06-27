const fs = require('fs');
let c = fs.readFileSync('d:\\\\WEBSITES\\\\THE ZEHOSP\\\\ZEMORA DENTAL\\\\book-appointment.html', 'utf8');
if (c.includes('\\\\n')) {
   if (!c.startsWith('"')) {
       c = '"' + c + '"';
   }
   try {
       c = JSON.parse(c);
   } catch(e) {
       console.log('Failed JSON parse:', e.message);
       // manual replacement as fallback
       c = c.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/^"/, '').replace(/"$/, '');
   }
   fs.writeFileSync('d:\\\\WEBSITES\\\\THE ZEHOSP\\\\ZEMORA DENTAL\\\\book-appointment.html', c);
   console.log('Fixed newlines.');
} else {
   console.log('No \\n found.');
}
