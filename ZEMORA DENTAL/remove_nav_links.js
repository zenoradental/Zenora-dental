const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

const patterns = [
    /<a[^>]*>\s*<div>Services Details<\/div>\s*<\/a>/g,
    /<a[^>]*>\s*<div>Doctor Details<\/div>\s*<\/a>/g,
    /<a[^>]*>\s*<div>Blog Details<\/div>\s*<\/a>/g,
    /<a[^>]*>\s*<div>404<\/div>\s*<\/a>/g
];

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  patterns.forEach(p => {
      content = content.replace(p, '');
  });

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Removed links in', f);
  }
});
