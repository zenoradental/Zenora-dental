const html = require('fs').readFileSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html', 'utf8');
const idx = html.indexOf('<div class="footer_menu">');
if (idx !== -1) {
    console.log(html.substring(idx, idx + 2500));
} else {
    console.log('not found');
}
