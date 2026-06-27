const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace strictly <div>About Us</div> to <div>About</div>
  content = content.replace(/<div>About Us<\/div>/g, '<div>About</div>');

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Renamed About Us in', f);
  }
});
