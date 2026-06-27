const fs = require('fs');

const fixIcons = (filename) => {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf8');

  code = code.replace(/https:\/\/zenoradentalofficial\.netlify\.app\/assets\/img\/gen_icon-calendar\.png/g, 'https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-calendar.png');
  code = code.replace(/https:\/\/zenoradentalofficial\.netlify\.app\/assets\/img\/gen_icon-user\.png/g, 'https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-user.png');
  code = code.replace(/https:\/\/zenoradentalofficial\.netlify\.app\/assets\/img\/gen_icon-info\.png/g, 'https://cdn.jsdelivr.net/gh/ROCKERM2010/Zenora-dental@main/assets/img/gen_icon-info.png');

  fs.writeFileSync(filename, code);
};

fixIcons('server.js');
fixIcons('generate-preview.js');
fixIcons('send-all-tests.js');
console.log('Successfully updated backend to use jsDelivr CDN URLs!');
