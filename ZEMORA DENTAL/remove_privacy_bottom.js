const fs = require('fs');
const path = require('path');

const files = [
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/book-appointment.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/about.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/service.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/blog.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/book-appointment.html',
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/contact.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;
    
    const regex = /<div class="footer-bottom_right">[\s\S]*?<\/div>\s*<div class="footer-bottom_right-divider"><\/div>\s*<a href="privacy.html" class="footer-menu_link w-inline-block">\s*<div>Privacy Policy<\/div>\s*<\/a>\s*<\/div>/g;
    
    html = html.replace(regex, '');

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Removed footer-bottom_right in ' + file);
    }
});
