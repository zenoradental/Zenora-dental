const fs = require('fs');
const path = require('path');

const files = [
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/book-appointment.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/privacy.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/terms.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/cookies.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/licenses.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/privacy.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/terms.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/cookies.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/licenses.html'
];

const newTextHtml = `<div class="footer-legal-links" style="font-size: 14px; opacity: 0.8;">
                                        <a href="privacy.html" style="color: inherit; text-decoration: none; margin-right: 12px;">Privacy Policy</a>
                                        <a href="terms.html" style="color: inherit; text-decoration: none;">Terms &amp; Conditions</a>
                                    </div>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    // The button has class="button_primary"
    // We match the footer_bottom_right block
    const rightRegex = /<div class="footer-bottom_right" style="display: flex; align-items: center; gap: 32px;">\s*<div class="footer-social-icons" style="display: flex; gap: 16px; align-items: center;">([\s\S]*?)<\/div>\s*(?:<a data-wf--button-primary[\s\S]*?<\/a>)?\s*<\/div>/;

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
        console.log('Replaced button with text in ' + file);
    }
});
