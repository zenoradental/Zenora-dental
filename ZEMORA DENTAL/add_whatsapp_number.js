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

        // Update the zenoraLead JS function to use the clinic's WhatsApp number (India +91)
        const oldOpen = 'try{ window.open("https://wa.me/?text="+msg,"_blank"); }catch(_){}';
        const newOpen = 'try{ window.open("https://wa.me/917975693436?text="+msg,"_blank"); }catch(_){}';
        content = content.replace(oldOpen, newOpen);

        if (content !== original) {
            fs.writeFileSync(filePath, content);
            console.log('Updated WhatsApp number in', filePath);
        }
    });
}

updateForm();
