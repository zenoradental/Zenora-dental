const fs = require('fs');
const path = require('path');

const files = [
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/book-appointment.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/book-appointment.html'
];

const correctButtonHtml = `
                                <div class="button-container">
                                    <a data-wf--button-primary--variant="light" href="book-appointment.html" class="button_primary w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec w-inline-block">
                                        <div class="button_inner">
                                            <div class="button-text_wrap">
                                                <div class="button_text">Get Appointment</div>
                                            </div>
                                            <div class="button-icon_group w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec">
                                                <div class="button-icon_wrap">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                        <path d="M4.70139 0.75L10.5303 0.750201L10.5303 6.55165M0.530334 10.75L10.2896 0.990932" stroke="currentColor" stroke-width="1.5"></path>
                                                    </svg>
                                                </div>
                                                <div class="button-icon_wrap is-hover">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                        <path d="M4.70139 0.75L10.5303 0.750201L10.5303 6.55165M0.530334 10.75L10.2896 0.990932" stroke="currentColor" stroke-width="1.5"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    const footerInfoMatch = html.match(/<div class="footer_info">([\s\S]*?)<\/div>\s*<div id="w-node-/);
    if (footerInfoMatch) {
        let footerInfoContent = footerInfoMatch[1];
        
        // Remove the broken button if it exists
        const brokenButtonRegex = /<a data-wf--button-primary--variant="light" href="book-appointment\.html" class="button_primary w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec w-inline-block">[\s\S]*?<\/a>/;
        footerInfoContent = footerInfoContent.replace(brokenButtonRegex, '');
        
        // Remove any double insertion of correct button or existing button
        const correctButtonRegex = /<div class="button-container">\s*<a data-wf--button-primary--variant="light" href="book-appointment\.html" class="button_primary w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec w-inline-block">[\s\S]*?<\/a>\s*<\/div>/;
        footerInfoContent = footerInfoContent.replace(correctButtonRegex, '');

        // Now inject the correct button right after margin-bottom div
        const marginMatch = footerInfoContent.match(/<div class="margin-bottom margin-24px">[\s\S]*?<\/div>\s*<\/div>/);
        if (marginMatch) {
            const newFooterInfo = footerInfoContent.replace(marginMatch[0], marginMatch[0] + correctButtonHtml);
            html = html.replace(footerInfoMatch[1], newFooterInfo);
        }
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Fixed broken button in ' + file);
    }
});
