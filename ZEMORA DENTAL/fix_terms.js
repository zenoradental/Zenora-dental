const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

const patterns = [
    /<a[^>]*>\s*<div>Styleguide<\/div>\s*<\/a>/g,
    /<a[^>]*>\s*<div>Instruction<\/div>\s*<\/a>/g,
    /<div>Terms &Conditions<\/div>/g
];

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(patterns[0], '');
  content = content.replace(patterns[1], '');
  content = content.replace(patterns[2], '<div>Terms & Conditions</div>');

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', f);
  }
});
