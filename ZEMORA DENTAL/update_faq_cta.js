const fs = require('fs');
const glob = require('fs').readdirSync;
const path = require('path');

function replaceFaqCta() {
    const filesToUpdate = [
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/service.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/blog.html'
    ];

    const oldSvgPath = 'M21 16.42V19.9561C21 20.4811 20.5941 20.9167 20.0705 20.9537C19.6331 20.9846 19.2763 21 19 21C10.1634 21 3 13.8366 3 5C3 4.72371 3.01545 4.36687 3.04635 3.9295C3.08337 3.40588 3.51894 3 4.04386 3H7.5801C7.83678 3 8.05176 3.19442 8.07753 3.4498C8.10067 3.67907 8.12218 3.86314 8.14207 4.00202C8.34435 5.41472 8.75753 6.75936 9.3487 8.00303C9.44359 8.20265 9.38171 8.44159 9.20185 8.57006L7.04355 10.1118C8.35752 13.1811 10.8189 15.6425 13.8882 16.9565L15.4271 14.8019C15.5572 14.6199 15.799 14.5573 16.001 14.6532C17.2446 15.2439 18.5891 15.6566 20.0016 15.8584C20.1396 15.8782 20.3225 15.8995 20.5502 15.9225C20.8056 15.9483 21 16.1633 21 16.42Z';
    const newSvgPath = 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z'; // Chat Bubble

    filesToUpdate.forEach(file => {
        if (!fs.existsSync(file)) return;
        let html = fs.readFileSync(file, 'utf8');
        let originalHtml = html;

        // Change text
        html = html.replace(/<div class="button_text">Make A Call<\/div>/g, '<div class="button_text">Contact Us<\/div>');
        
        // Change button href inside faq-cta_info-button ONLY
        // We'll use a regex that specifically targets the book-appointment.html href near Make A Call or Contact Us
        const ctaStart = html.indexOf('faq-cta_info-button');
        if (ctaStart !== -1) {
            const linkRegex = /<a[^>]*href="book-appointment.html"[^>]*>/g;
            // Limit search area
            const block = html.substring(ctaStart, ctaStart + 1000);
            const replacedBlock = block.replace(linkRegex, (match) => {
                return match.replace('book-appointment.html', 'contact.html');
            });
            html = html.substring(0, ctaStart) + replacedBlock + html.substring(ctaStart + 1000);
        }

        // Change icon SVG path
        html = html.replace(oldSvgPath, newSvgPath);

        if (html !== originalHtml) {
            fs.writeFileSync(file, html);
            console.log('Updated ' + file);
        }
    });
}

replaceFaqCta();
