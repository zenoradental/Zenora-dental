const fs = require('fs');

const fixGmailIssue = (filename) => {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf8');

  // 1. Replace the SVG definitions with the thin-line SF Regular PNGs 
  const calendarIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const doctorIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const infoIcon = `<img src="https://img.icons8.com/sf-regular/96/475569/info.png" alt="Info" style="width: 24px; height: 24px; display: block; border: 0;" />`;

  code = code.replace(/const calendarIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const calendarIcon = `' + calendarIcon + '`;');
  code = code.replace(/const doctorIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const doctorIcon = `' + doctorIcon + '`;');
  code = code.replace(/const infoIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const infoIcon = `' + infoIcon + '`;');

  // 2. Fix the layout logic in generateEmailHTML to support BOTH icons and hero images without breaking
  // Current logic in the reverted file:
  const oldLogic = `<!-- The Professional Icon Circle -->
                    <div style="display: inline-block; width: 24px; height: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; padding: 16px; margin-bottom: 20px; color: #475569;">
                      \${icon}
                    </div>`;

  const newLogic = `\${icon && (icon.includes('<svg') || icon.includes('<img')) ? \`
                    <!-- The Professional Icon Circle (EXACT SAME LAYOUT) -->
                    <div style="display: inline-block; width: 24px; height: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; padding: 16px; margin-bottom: 20px; color: #475569;">
                      \${icon}
                    </div>
                    \` : icon && icon.startsWith('http') ? \`
                    <!-- The Hero Image (For Promos) -->
                    <div style="margin-bottom: 30px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                      <img src="\${icon}" alt="Notification Image" style="width: 100%; max-width: 600px; height: auto; display: block;" />
                    </div>
                    \` : ''}`;

  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync(filename, code);
};

fixGmailIssue('server.js');
fixGmailIssue('generate-preview.js');
console.log('Fixed Gmail icons while preserving perfect layout.');
