const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // The order required: Home, Services, Blog, About, Contact, Pages
  // Find the <nav role="navigation" class="navbar_menu w-nav-menu"> ... up to <div data-delay="200"
  
  const startIdx = content.indexOf('<nav role="navigation" class="navbar_menu w-nav-menu">');
  const endIdx = content.indexOf('<div data-delay="200" data-hover="false" class="navbar_dropdown w-dropdown">', startIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
      const prefix = content.substring(0, startIdx + '<nav role="navigation" class="navbar_menu w-nav-menu">'.length);
      const suffix = content.substring(endIdx);
      const linksBlock = content.substring(prefix.length, endIdx);
      
      // Extract individual links
      // They look like: <a href="..." ...> ... </a>
      const linkRegex = /<a\s+href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*/g;
      
      let match;
      const links = {};
      
      while ((match = linkRegex.exec(linksBlock)) !== null) {
          links[match[1]] = match[0]; // href -> full HTML of the tag
      }
      
      // Required order: Home, Services, Blog, About, Contact
      const order = ['index.html', 'service.html', 'blog.html', 'about.html', 'contact.html'];
      
      let newLinksBlock = '\n                            ';
      order.forEach(href => {
          if (links[href]) {
              newLinksBlock += links[href].trim() + '\n                            ';
          }
      });
      
      content = prefix + newLinksBlock + suffix;
  }

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Reordered navbar in', f);
  }
});
