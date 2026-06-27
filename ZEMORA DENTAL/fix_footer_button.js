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

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    if (file.includes('contact.html')) return; // No footer_info in contact.html

    // Check if the button is ALREADY in footer_info
    const footerInfoMatch = html.match(/<div class="footer_info">([\s\S]*?)<\/div>\s*<div id="w-node-/);
    if (footerInfoMatch) {
        if (!footerInfoMatch[1].includes('Get Appointment')) {
            // It's missing the button. We insert it right after the margin-bottom div.
            const marginMatch = footerInfoMatch[1].match(/<div class="margin-bottom margin-24px">[\s\S]*?<\/div>\s*<\/div>/);
            if (marginMatch) {
                const newFooterInfo = footerInfoMatch[1].replace(marginMatch[0], marginMatch[0] + buttonHtml);
                html = html.replace(footerInfoMatch[1], newFooterInfo);
            }
        }
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Restored Get Appointment button in ' + file);
    }
});
