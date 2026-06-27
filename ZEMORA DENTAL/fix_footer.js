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

        // Add Contact Us to Navigation
        if (!html.includes('<div>Contact Us</div>') || html.indexOf('<div>Contact Us</div>') === html.lastIndexOf('<div>Contact Us</div>') && !html.split('<div>Contact Us</div>')[1].includes('footer')) {
            // We need to ensure we don't add it twice.
            // Let's replace the blog link with blog link + contact link inside the Navigation column
            const navRegex = /<div class="footer-menu_title">Navigation<\/div>([\s\S]*?)<div id="w-node-/;
            const navMatch = html.match(navRegex);
            if (navMatch && !navMatch[1].includes('Contact Us')) {
                const blogLinkHtml = `<a href="blog.html" class="footer-menu_link w-inline-block">\n                                            <div>Blogs</div>\n                                        </a>`;
                html = html.replace(blogLinkHtml, blogLinkHtml + contactLink);
            }
        }

        // Add Privacy Policy to Legal
        const legalRegex = /<div class="footer-menu_title">Legal<\/div>([\s\S]*?)<div id="w-node-/;
        const legalMatch = html.match(legalRegex);
        if (legalMatch && !legalMatch[1].includes('Privacy Policy')) {
            const termsLinkHtml = `<a href="terms.html" class="footer-menu_link w-inline-block">\n                                            <div>Terms &amp; Conditions</div>\n                                        </a>`;
            html = html.replace(termsLinkHtml, termsLinkHtml + privacyLink);
        }

        if (html !== originalHtml) {
            fs.writeFileSync(file, html);
            console.log('Fixed footer in ' + file);
        }
    });
}

fixFooter();
