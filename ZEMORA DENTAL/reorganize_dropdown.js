const fs = require('fs');
const files = fs.readdirSync('d:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL').filter(f => f.endsWith('.html') && !f.includes('variant'));

files.forEach(f => {
  const filePath = 'd:/WEBSITES/THE ZEHOSP/ZEMORA DENTAL/' + f;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We find the wrapper start and end
  const startMarker = '<div class="navbar-dropdown_wrapper">';
  // Let's find the closing div of the wrapper
  // The wrapper contains columns. The next sibling is usually `<div class="navbar_dropdown-corner` or similar.
  // We can just use regex to replace from startMarker to the end of the 3rd column.

  const replacement = `<div class="navbar-dropdown_wrapper">
                                        <div class="navbar-dropdown_column">
                                            <a href="index.html" data-animation="text-flip" aria-current="page" class="navbar-dropdown_link w-inline-block w--current">
                                                <div>Home</div>
                                            </a>
                                            <a href="about.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>About </div>
                                            </a>
                                            <a href="service.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Services</div>
                                            </a>
                                            <a href="contact.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Contact Us</div>
                                            </a>
                                        </div>
                                        <div class="navbar-dropdown_column">
                                            <a href="blog.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Blogs</div>
                                            </a>
                                            <a href="terms.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Terms &amp; Conditions</div>
                                            </a>
                                            <a href="privacy.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Privacy Policy</div>
                                            </a>
                                            <a href="cookies.html" data-animation="text-flip" class="navbar-dropdown_link w-inline-block">
                                                <div>Cookies</div>
                                            </a>
                                        </div>
                                    </div>`;

  // Use a regex to match the old wrapper. It starts with startMarker and ends with the 3rd column's closing div.
  // Let's just match everything between startMarker and the closing </div> of the wrapper.
  // Because HTML can have newlines, we use [\s\S]*?
  const regex = /<div class="navbar-dropdown_wrapper">[\s\S]*?<div class="navbar-dropdown_column">[\s\S]*?<\/div>[\s\S]*?<div class="navbar-dropdown_column">[\s\S]*?<\/div>[\s\S]*?<div class="navbar-dropdown_column">[\s\S]*?<\/div>\s*<\/div>/;
  
  content = content.replace(regex, replacement);

  if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Reorganized dropdown in', f);
  }
});
