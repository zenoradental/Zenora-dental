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

const adminBtn = `<a href="/admin" style="font-size: 12px; padding: 4px 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; color: inherit; text-decoration: none; opacity: 0.6; transition: opacity 0.2s ease, border-color 0.2s ease;" onmouseover="this.style.opacity='1'; this.style.borderColor='rgba(255,255,255,0.4)';" onmouseout="this.style.opacity='0.6'; this.style.borderColor='rgba(255,255,255,0.2)';">Admin Portal</a>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    
    if (html.includes('Artistry in Every Smile')) {
        // Replace with Admin button
        html = html.replace(/Artistry in Every Smile/g, adminBtn);
        fs.writeFileSync(file, html);
        console.log('Added Admin Portal button in ' + file);
    }
});
