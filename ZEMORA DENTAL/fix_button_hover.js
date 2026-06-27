const fs = require('fs');
const path = require('path');

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
    'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/book-appointment.html'
];

const hoverFixStyle = `
                                <style>
                                    .footer_info .button_primary:hover {
                                        background-color: #ffffff !important;
                                        color: var(--primitive-color--primary-900) !important;
                                        opacity: 0.85;
                                        transform: translateY(-2px);
                                        transition: all 0.3s ease;
                                    }
                                </style>`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    // Check if the style block is already there
    if (!html.includes('.footer_info .button_primary:hover')) {
        // Inject right after the closing </a> tag of the button
        const buttonEndRegex = /(<div class="button-container">\s*<a data-wf--button-primary--variant="light" href="book-appointment\.html" class="button_primary w-variant-62db4792-8717-dbe8-e811-0d36eb02f9ec w-inline-block">[\s\S]*?<\/a>\s*)(<\/div>)/;
        
        if (buttonEndRegex.test(html)) {
            html = html.replace(buttonEndRegex, `$1${hoverFixStyle}\n                                $2`);
        }
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Fixed hover state in ' + file);
    }
});
