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
    
    // Replace href="/admin" with href="http://localhost:5174/" ONLY for the admin button we just added
    if (html.includes('href="/admin"')) {
        html = html.replace(/href="\/admin"/g, 'href="http://localhost:5174/" target="_blank"');
        fs.writeFileSync(file, html);
        console.log('Connected Admin button to localhost:5174 in ' + file);
    }
});
