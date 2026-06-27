const html = require('fs').readFileSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html', 'utf8');
const idx = html.indexOf('Navigation');
if (idx !== -1) {
    console.log(html.substring(idx - 1000, idx + 2000));
} else {
    console.log('not found');
}
