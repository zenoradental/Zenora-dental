const fs = require('fs');
const path = require('path');
const dir = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const scriptTag = `
    <!-- Vercel Analytics -->
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
`;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('/_vercel/insights/script.js')) {
        content = content.replace('</head>', scriptTag + '</head>');
        fs.writeFileSync(filePath, content);
        console.log('Added to ' + file);
    }
}
console.log('Done');
