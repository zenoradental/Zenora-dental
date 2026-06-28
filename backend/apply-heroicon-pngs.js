const fs = require('fs');

const fixIconsAndLayout = (filename) => {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf8');

  // Replace SVGs with the exact Heroicon PNGs hosted on their Netlify
  const calendarIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const doctorIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const clockIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-clock.png" alt="Clock" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const toothIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-tooth.png" alt="Tooth" style="width: 24px; height: 24px; display: block; border: 0;" />`;
  const infoIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-info.png" alt="Info" style="width: 24px; height: 24px; display: block; border: 0;" />`;

  code = code.replace(/const calendarIcon = `.*`;/g, 'const calendarIcon = `' + calendarIcon + '`;');
  code = code.replace(/const doctorIcon = `.*`;/g, 'const doctorIcon = `' + doctorIcon + '`;');
  code = code.replace(/const clockIcon = `.*`;/g, 'const clockIcon = `' + clockIcon + '`;');
  code = code.replace(/const toothIcon = `.*`;/g, 'const toothIcon = `' + toothIcon + '`;');
  code = code.replace(/const infoIcon = `.*`;/g, 'const infoIcon = `' + infoIcon + '`;');

  // Fix the layout logic in generateEmailHTML so promo hero images don't break
  const oldLogic = `<!-- The Professional Icon Circle -->
                    <div style="display: inline-block; width: 24px; height: 24px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 50%; padding: 16px; margin-bottom: 20px; color: #475569;">
                      \${icon}
                    </div>`;

  const newLogic = `\${icon && (icon.includes('<svg') || icon.includes('<img')) ? \`
                    <!-- The Professional Icon Circle -->
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

fixIconsAndLayout('server.js');
fixIconsAndLayout('generate-preview.js');
console.log('Successfully updated backend to use Heroicon PNGs from Netlify!');
