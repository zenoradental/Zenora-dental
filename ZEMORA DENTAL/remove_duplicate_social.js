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
    
    // We want to match <div class="footer-social-icons"... and its contents until the NEXT </div> that closes it.
    // The structure is:
    // <div class="footer-social-icons" style="...">
    //   <a ...> <div> <svg>...</svg> </div> </a>
    //   ... x4
    // </div>
    //
    // A safe regex uses the exact known boundaries since we injected it.
    // We can just match <div class="footer-social-icons"[^>]*>[\s\S]*?<\/a>\s*<\/div>
    // Wait, the last child is </a>, followed by \n</div> which closes footer-social-icons.
    
    const regex = /<div class="footer-social-icons"[^>]*>[\s\S]*?<\/a>\s*<\/div>\s*/;
    if (regex.test(html)) {
        html = html.replace(regex, '');
        fs.writeFileSync(file, html);
        console.log('Removed duplicate social icons from ' + file);
    }
});
