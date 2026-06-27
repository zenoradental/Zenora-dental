const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

const searchStr = `<a href="cookies.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Cookies</div>
                                            </a>`;
                                            
const replaceStr = `<a href="cookies.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Cookies</div>
                                            </a>
                                            <a href="licenses.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Licenses</div>
                                            </a>`;

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(searchStr, replaceStr);

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Added Licenses to header dropdown in', f);
  }
});
