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

const buttonHtml = `
                                <a data-wf--button-primary--variant="light" href="book-appointment.html" class="button_primary w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec w-inline-block">
                                    <div class="button_inner">
                                        <div class="button-text_wrap">
                                            <div class="button_text">Get Appointment</div>
                                        </div>
                                        <div class="button-icon_group w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec">
                                            <div class="button-icon_item">
                                                <div class="button-icon_embed w-embed">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                        <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="button-icon_item">
                                                <div class="button-icon_embed w-embed">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 16" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                        <path d="M1 8H15M15 8L8 1M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>`;

const newTextHtml = `<div class="footer-legal-links" style="font-size: 14px; opacity: 0.8;">
                                        Designed by Rocker / Powered by Rocker
                                    </div>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    // 1. Add Get Appointment button back to footer_info IF it's not contact.html (wait, let's just add it back if missing)
    if (!file.includes('contact.html') && !html.includes('class="button_primary w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec w-inline-block"')) {
        const footerInfoParaRegex = /<div class="footer-info_para-wrap">\s*<p class="footer-info_para">[\s\S]*?<\/p>\s*<\/div>\s*<\/div>/;
        const footerInfoMatch = html.match(footerInfoParaRegex);
        if (footerInfoMatch) {
            html = html.replace(footerInfoMatch[0], footerInfoMatch[0] + buttonHtml);
        }
    }

    // 2. Replace Privacy/Terms text with new Rocker text
    const rightRegex = /<div class="footer-legal-links"[^>]*>[\s\S]*?<\/div>/;
    const match = html.match(rightRegex);
    if (match) {
        html = html.replace(match[0], newTextHtml);
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Restored button and updated Rocker text in ' + file);
    }
});
