const fs = require('fs');

function fixFooter() {
    const files = [
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/about.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
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

    const contactLink = `
                                        <a href="contact.html" class="footer-menu_link w-inline-block">
                                            <div>Contact Us</div>
                                        </a>`;
                                        
    const privacyLink = `
                                        <a href="privacy.html" class="footer-menu_link w-inline-block">
                                            <div>Privacy Policy</div>
                                        </a>`;

    files.forEach(file => {
        if (!fs.existsSync(file)) return;
        let html = fs.readFileSync(file, 'utf8');
        let originalHtml = html;

        // Add Contact Us to Navigation if missing in footer
        const navTitleRegex = /<div class="footer-menu_title">Navigation<\/div>([\s\S]*?)<\/div>\s*<\/div>/;
        const navMatch = html.match(navTitleRegex);
        if (navMatch && !navMatch[1].includes('Contact Us')) {
            const blogRegex = /(<a[^>]*href="blog\.html"[^>]*>[\s\S]*?<\/a>)/;
            const blogMatch = navMatch[1].match(blogRegex);
            if (blogMatch) {
                const newNavBlock = navMatch[0].replace(blogMatch[0], blogMatch[0] + contactLink);
                html = html.replace(navMatch[0], newNavBlock);
            }
        }

        // Add Privacy Policy to Legal if missing in footer
        const legalTitleRegex = /<div class="footer-menu_title">Legal<\/div>([\s\S]*?)<\/div>\s*<\/div>/;
        const legalMatch = html.match(legalTitleRegex);
        if (legalMatch && !legalMatch[1].includes('Privacy Policy')) {
            const termsRegex = /(<a[^>]*href="terms\.html"[^>]*>[\s\S]*?<\/a>)/;
            const termsMatch = legalMatch[1].match(termsRegex);
            if (termsMatch) {
                const newLegalBlock = legalMatch[0].replace(termsMatch[0], termsMatch[0] + privacyLink);
                html = html.replace(legalMatch[0], newLegalBlock);
            }
        }

        if (html !== originalHtml) {
            fs.writeFileSync(file, html);
            console.log('Fixed footer in ' + file);
        }
    });
}

fixFooter();
