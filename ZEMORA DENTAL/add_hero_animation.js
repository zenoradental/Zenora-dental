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

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    let originalHtml = html;

    const footerInfoMatch = html.match(/<div class="footer_info">([\s\S]*?)<\/div>\s*<div id="w-node-/);
    if (footerInfoMatch) {
        let footerInfoContent = footerInfoMatch[1];
        
        // 1. Update the button container with the data-w-id from the hero button
        const oldContainer = '<div class="button-container">';
        const newContainer = '<div data-w-id="123dbd0a-737f-01ae-eb77-4a2f18726493" class="button-container">';
        footerInfoContent = footerInfoContent.replace(oldContainer, newContainer);
        
        // 2. Clean up the inline style block to remove conflicting animations
        const oldStyleBlock = `<style>
                                    .footer_info .button_primary:hover {
                                        background-color: #ffffff !important;
                                        color: var(--primitive-color--primary-900) !important;
                                        opacity: 0.85;
                                        transform: translateY(-2px);
                                        transition: all 0.3s ease;
                                    }
                                </style>`;
                                
        const newStyleBlock = `<style>
                                    .footer_info .button_primary:hover {
                                        background-color: #ffffff !important;
                                        color: var(--primitive-color--primary-900) !important;
                                    }
                                </style>`;
                                
        // regex replace to handle varied spacing just in case
        footerInfoContent = footerInfoContent.replace(/<style>\s*\.footer_info \.button_primary:hover \{[\s\S]*?\}\s*<\/style>/, newStyleBlock);

        html = html.replace(footerInfoMatch[1], footerInfoContent);
    }

    if (html !== originalHtml) {
        fs.writeFileSync(file, html);
        console.log('Added animation to ' + file);
    }
});
