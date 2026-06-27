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

        // Navigation fix
        const blogStr = '<a href="blog.html" class="footer-menu_link w-inline-block">\r\n                                            <div>Blogs</div>\r\n                                        </a>';
        const blogStr2 = '<a href="blog.html" class="footer-menu_link w-inline-block">\n                                            <div>Blogs</div>\n                                        </a>';
        
        if (!html.includes('<div>Contact Us</div>') || html.indexOf('<div>Contact Us</div>') === html.lastIndexOf('<div>Contact Us</div>')) {
            if (html.includes(blogStr)) {
                html = html.replace(blogStr, blogStr + contactLink);
            } else if (html.includes(blogStr2)) {
                html = html.replace(blogStr2, blogStr2 + contactLink);
            }
        }

        // Legal fix
        const termsStr = '<a href="terms.html" class="footer-menu_link w-inline-block">\r\n                                            <div>Terms &amp; Conditions</div>\r\n                                        </a>';
        const termsStr2 = '<a href="terms.html" class="footer-menu_link w-inline-block">\n                                            <div>Terms &amp; Conditions</div>\n                                        </a>';

        if (!html.includes('<div>Privacy Policy</div>') || html.indexOf('<div>Privacy Policy</div>') === html.lastIndexOf('<div>Privacy Policy</div>')) {
            if (html.includes(termsStr)) {
                html = html.replace(termsStr, termsStr + privacyLink);
            } else if (html.includes(termsStr2)) {
                html = html.replace(termsStr2, termsStr2 + privacyLink);
            }
        }

        if (html !== originalHtml) {
            fs.writeFileSync(file, html);
            console.log('Fixed footer in ' + file);
        }
    });
}

fixFooter();
