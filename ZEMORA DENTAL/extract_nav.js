const fs = require('fs');
const html = fs.readFileSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html', 'utf8');
const start = html.indexOf('<nav role="navigation"');
const end = html.indexOf('</nav>');
fs.writeFileSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/nav_temp.html', html.substring(start, end + 6));
console.log('Extracted to nav_temp.html');
