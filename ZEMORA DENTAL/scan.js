const fs = require('fs');
const path = require('path');

const rootDir = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL';
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const issues = {};

htmlFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const fileIssues = [];

    // Find all hrefs
    const hrefRegex = /href=["']([^"']*)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
        const link = match[1];
        if (link === '#' || link === '') {
            fileIssues.push('Placeholder link (href="' + link + '")');
        } else if (!link.startsWith('http') && !link.startsWith('mailto:') && !link.startsWith('tel:')) {
            // Local file check
            const targetPath = link.split('#')[0].split('?')[0]; // remove hash and query
            if (targetPath) {
                const fullTargetPath = path.join(rootDir, targetPath);
                if (!fs.existsSync(fullTargetPath)) {
                    fileIssues.push('Broken link: ' + link);
                }
            }
        }
    }

    // Find all script/img src
    const srcRegex = /src=["']([^"']*)["']/g;
    while ((match = srcRegex.exec(content)) !== null) {
        const src = match[1];
        if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
            const targetPath = src.split('?')[0];
            if (targetPath) {
                const fullTargetPath = path.join(rootDir, targetPath);
                if (!fs.existsSync(fullTargetPath)) {
                    fileIssues.push('Missing asset: ' + src);
                }
            }
        }
    }

    if (fileIssues.length > 0) {
        issues[file] = [...new Set(fileIssues)];
    }
});

console.log(JSON.stringify(issues, null, 2));
