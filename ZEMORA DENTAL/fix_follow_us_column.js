const fs = require('fs');

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
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/book-appointment.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/contact.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    
    // Check if the missing div issue is present
    const badStructure = `</a>\n                                    </div>\n                                <div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">`;
    const goodStructure = `</a>\n                                    </div>\n                                </div>\n                                <div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">`;
    
    if (html.includes(badStructure)) {
        html = html.replace(badStructure, goodStructure);
        fs.writeFileSync(file, html);
        console.log('Fixed structure in ' + file);
    } else {
        // try with variable whitespace
        const regex = /<\/a>\s*<\/div>\s*<div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">/;
        if (regex.test(html)) {
            html = html.replace(regex, `</a>\n                                    </div>\n                                </div>\n                                <div id="w-node-_02084d99-4d3e-67aa-07d3-fc9302298ce0-4af74ce9" class="footer-links-column">`);
            fs.writeFileSync(file, html);
            console.log('Fixed structure (regex) in ' + file);
        }
    }
});
