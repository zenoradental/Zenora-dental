const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix Terms &Conditions in the footer (and anywhere else it might have been missed)
  // Look for <div>Terms &Conditions</div> or <div>Terms &amp;Conditions</div>
  content = content.replace(/<div>Terms &Conditions<\/div>/g, '<div>Terms & Conditions</div>');
  content = content.replace(/<div>Terms &amp;Conditions<\/div>/g, '<div>Terms &amp; Conditions</div>');

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed Terms in footer for', f);
  }
});
