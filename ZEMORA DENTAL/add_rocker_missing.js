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

    // Check if it already has the rocker text
    if (html.includes('Designed by Rocker')) return;

    // Find the social icons container in footer_bottom_right and append the text
    const rightRegex = /<div class="footer-bottom_right" style="display: flex; align-items: center; gap: 32px;">\s*<div class="footer-social-icons" style="display: flex; gap: 16px; align-items: center;">([\s\S]*?)<\/div>\s*<\/div>/;
    const match = html.match(rightRegex);
    if (match) {
        const socialIcons = match[1];
        const newRightBlock = `<div class="footer-bottom_right" style="display: flex; align-items: center; gap: 32px;">
                                    <div class="footer-social-icons" style="display: flex; gap: 16px; align-items: center;">${socialIcons}</div>
                                    ${newTextHtml}
                                </div>`;
        html = html.replace(match[0], newRightBlock);
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Added Rocker text in ' + file);
    }
});
