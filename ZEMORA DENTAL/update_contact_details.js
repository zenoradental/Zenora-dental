const fs = require('fs');
const path = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/contact.html';

if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace the display phone number
    content = content.replace(/\+1 \(555\) 123-4567/g, '+91 79756 93436');
    
    // Replace the href phone number
    content = content.replace(/tel:\+15551234567/g, 'tel:+917975693436');
    
    fs.writeFileSync(path, content);
    console.log('Updated phone number in contact.html');
}
