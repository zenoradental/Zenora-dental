const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));
files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  
  const searchStr = '</script>\"\r\n\".        <script>';
  const replaceStr = '</script>\r\n        <script>';
  
  const searchStr2 = '</script>\"\n\".        <script>';
  const replaceStr2 = '</script>\n        <script>';

  if (content.includes(searchStr)) {
      content = content.replace(searchStr, replaceStr);
      fs.writeFileSync(filePath, content);
      console.log('Fixed \\r\\n in', f);
  } else if (content.includes(searchStr2)) {
      content = content.replace(searchStr2, replaceStr2);
      fs.writeFileSync(filePath, content);
      console.log('Fixed \\n in', f);
  }
});
