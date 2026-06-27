const fs = require('fs');
const path = require('path');

const rootDir = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL';
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html') && !f.includes('variant'));

const issues = [];

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all <a ... href="#">
    const regex = /<a[^>]*href=["']#["'][^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while((match = regex.exec(content)) !== null) {
        const classMatch = match[0].match(/class=["']([^"']*)["']/);
        const className = classMatch ? classMatch[1] : 'no-class';
        let text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (!text) text = '[Image/Icon only]';
        
        // Exclude dropdown toggles if they are supposed to be "#"
        if (className.includes('navbar-dropdown_link')) continue; 
        if (className.includes('w-dropdown-toggle')) continue; 
        
        issues.push({
            file: file,
            tag: '<a>',
            className: className,
            text: text.substring(0, 50),
            reason: 'href is "#" (Dead link/Placeholder)'
        });
    }

    const btnRegex = /<button[^>]*>([\s\S]*?)<\/button>/g;
    while((match = btnRegex.exec(content)) !== null) {
        if (!match[0].includes('type="submit"') && !match[0].includes('type="button"')) {
            const classMatch = match[0].match(/class=["']([^"']*)["']/);
            const className = classMatch ? classMatch[1] : 'no-class';
            let text = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
            if (!text) text = '[Image/Icon only]';
            issues.push({
                file: file,
                tag: '<button>',
                className: className,
                text: text.substring(0, 50),
                reason: 'Missing type attribute (could fail to submit/trigger)'
            });
        }
    }
});

const grouped = {};
issues.forEach(i => {
    if (!grouped[i.file]) grouped[i.file] = [];
    grouped[i.file].push(`${i.tag} "${i.text}" (class: ${i.className}) -> ${i.reason}`);
});

console.log(JSON.stringify(grouped, null, 2));
