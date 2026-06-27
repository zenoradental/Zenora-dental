const fs = require('fs');

function updateForm() {
    const files = [
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/index.html',
        'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/variant-blue/index.html'
    ];
    
    files.forEach(filePath => {
        if (!fs.existsSync(filePath)) return;
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // 1. Update the phone input to add pattern validation
        content = content.replace(
            /<input class="lead-form_input" type="tel" name="phone" placeholder="Phone number" required="">/g,
            '<input class="lead-form_input" type="tel" name="phone" placeholder="Phone number" pattern="[0-9\\\\+\\\\-\\\\s\\\\(\\\\)]{7,20}" title="Please enter a valid phone number" required="">'
        );

        // 2. Update the zenoraLead JS function to use the actual WhatsApp API instead of "#"
        const oldOpen = 'try{ window.open("#?text="+msg,"_blank"); }catch(_){}';
        const newOpen = 'try{ window.open("https://wa.me/?text="+msg,"_blank"); }catch(_){}';
        content = content.replace(oldOpen, newOpen);

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Updated form in', filePath);
        }
    });
}

updateForm();
