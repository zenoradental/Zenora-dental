const fs = require('fs');

const fixLayout = (filename) => {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf8');

  // We need to replace the hardcoded circle logic with a conditional that supports both icons and hero images
  const oldLogic = `<!-- The Professional Icon Circle -->
                  <div style="display: inline-block; width: 24px; height: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; padding: 16px; margin-bottom: 20px; color: #475569;">
                    \${icon}
                  </div>`;
                  
  const newLogic = `\${icon && icon.includes('<img') ? \`
                  <!-- The Professional Icon Circle -->
                  <div style="display: inline-block; width: 24px; height: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; padding: 16px; margin-bottom: 20px; color: #475569;">
                    \${icon}
                  </div>
                  \` : icon && icon.startsWith('http') ? \`
                  <!-- The Hero Image -->
                  <div style="margin-bottom: 30px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <img src="\${icon}" alt="Notification Image" style="width: 100%; max-width: 600px; height: auto; display: block;" />
                  </div>
                  \` : ''}`;

  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync(filename, code);
};

fixLayout('server.js');
fixLayout('generate-preview.js');
console.log('Fixed icon/hero layout logic.');
