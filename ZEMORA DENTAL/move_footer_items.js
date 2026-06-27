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

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    // 1. Extract Get Appointment button from footer_info
    let buttonHtml = '';
    const footerInfoRegex = /<div class="footer_info">([\s\S]*?)<\/div>\s*<div id="w-node-/;
    const footerInfoMatch = html.match(footerInfoRegex);
    if (footerInfoMatch) {
        let footerInfoContent = footerInfoMatch[1];
        
        // The button has class="button_primary..."
        const buttonRegex = /<a data-wf--button-primary--variant="light" href="book-appointment.html" class="button_primary[\s\S]*?<\/a>/;
        const buttonMatch = footerInfoContent.match(buttonRegex);
        if (buttonMatch) {
            buttonHtml = buttonMatch[0];
            // Remove button from footer_info
            footerInfoContent = footerInfoContent.replace(buttonMatch[0], '');
            
            // Replace footer_info block in main html
            html = html.replace(footerInfoMatch[1], footerInfoContent);
        }
    }

    // 2. Extract Social Icons from Follow us column
    let socialIconsHtml = '';
    const followUsColumnRegex = /<div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">[\s\S]*?<div class="footer-menu_link-wrap is-social">([\s\S]*?)<\/div>\s*<\/div>/;
    const followUsMatch = html.match(followUsColumnRegex);
    if (followUsMatch) {
        let socialWrapContent = followUsMatch[1];
        
        // Find all <a> elements
        const aRegex = /<a href="[^"]*" target="_blank" class="footer-menu_link w-inline-block">[\s\S]*?<\/a>/g;
        let match;
        while ((match = aRegex.exec(socialWrapContent)) !== null) {
            let aContent = match[0];
            
            // Extract the SVG
            const svgMatch = aContent.match(/<svg[\s\S]*?<\/svg>/);
            if (svgMatch) {
                // Determine the href
                const hrefMatch = aContent.match(/href="([^"]*)"/);
                const href = hrefMatch ? hrefMatch[1] : "#";
                
                socialIconsHtml += `\n<a href="${href}" target="_blank" style="display:flex; align-items:center; justify-content:center; color:currentColor; text-decoration:none;">\n    <div style="width:24px; height:24px;">\n        ${svgMatch[0]}\n    </div>\n</a>`;
            }
        }

        // Remove the entire Follow us column from HTML
        html = html.replace(followUsMatch[0], '');
    }

    // 3. Rebuild footer_bottom
    const footerBottomRegex = /<div data-w-id="c179c474-dbf0-a107-6eba-5d7b4af74d6f" class="footer_bottom">[\s\S]*?<\/footer>/;
    const footerBottomMatch = html.match(footerBottomRegex);
    if (footerBottomMatch && buttonHtml) {
        const newFooterBottom = `<div data-w-id="c179c474-dbf0-a107-6eba-5d7b4af74d6f" class="footer_bottom">
                            <div class="footer-bottom_element" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                                <div class="text-color-dark" style="margin-bottom: 0;">
                                    &copy; 2026 Zenora Dental. All rights reserved.
                                </div>
                                <div class="footer-bottom_right" style="display: flex; align-items: center; gap: 32px;">
                                    <div class="footer-social-icons" style="display: flex; gap: 16px; align-items: center;">
                                        ${socialIconsHtml}
                                    </div>
                                    ${buttonHtml.replace('margin-top: 24px;', '')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>`;
        
        html = html.replace(footerBottomMatch[0], newFooterBottom);
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Updated footer layout in ' + file);
    }
});
