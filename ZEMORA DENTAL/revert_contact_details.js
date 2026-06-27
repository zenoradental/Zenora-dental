const fs = require('fs');
const path = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html';

if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Revert the display phone number
    content = content.replace(/\+91 79756 93436/g, '+1 (555) 123-4567');
    
    // Revert the href phone number
    content = content.replace(/tel:\+917975693436/g, 'tel:+15551234567');
    
    fs.writeFileSync(path, content);
    console.log('Reverted phone number in contact.html');
}
