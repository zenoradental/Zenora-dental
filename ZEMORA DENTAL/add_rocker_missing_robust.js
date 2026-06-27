const fs = require('fs');
const path = require('path');

const files = [
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/privacy.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/terms.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/cookies.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/licenses.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/privacy.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/terms.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/cookies.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/licenses.html'
];

const newTextHtml = `<div class="footer-legal-links" style="font-size: 14px; opacity: 0.8;">
                                        Designed by Rocker / Powered by Rocker
                                    </div>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    if (html.includes('Designed by Rocker')) return;

    // This matches the ending of social icons and the closing of bottom_right
    html = html.replace(/<div class="footer-social-icons"([\s\S]*?)<\/div>\s*<\/div>/, `<div class="footer-social-icons"$1</div>\n${newTextHtml}\n</div>`);

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Added Rocker text to missing page: ' + file);
    }
});
