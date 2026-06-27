const fs = require('fs');

function updatePhoneLength() {
    const files = [
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html'
    ];
    
    files.forEach(filePath => {
        if (!fs.existsSync(filePath)) return;
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Replace the current phone input with one that enforces exactly 10 digits
        const oldInput = '<input class="lead-form_input" type="tel" name="phone" placeholder="Phone number" pattern="[0-9\\\\+\\\\-\\\\s\\\\(\\\\)]{7,20}" title="Please enter a valid phone number" required="">';
        const newInput = '<input class="lead-form_input" type="tel" name="phone" placeholder="Phone number" pattern="[0-9]{10}" maxlength="10" title="Please enter exactly 10 digits" required="">';
        
        content = content.replace(oldInput, newInput);

        // Just in case it was modified slightly, try a regex replacement as fallback
        if (content === original) {
            const regex = /<input[^>]*name="phone"[^>]*>/;
            content = content.replace(regex, newInput);
        }

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Updated phone input length in', filePath);
        }
    });
}

updatePhoneLength();
