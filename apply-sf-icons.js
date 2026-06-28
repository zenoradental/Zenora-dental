const fs = require('fs');

const calendarIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-calendar.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const doctorIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-user.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const infoIcon = `<img src="https://zenoradentalofficial.vercel.app/assets/img/gen_icon-info.png" alt="Info" style="width: 24px; height: 24px; display: block; border: 0;" />`;

const updateFile = (filename) => {
  if (!fs.existsSync(filename)) return;
  let code = fs.readFileSync(filename, 'utf8');
  
  // Replace the old Icons8 links with the new SF Regular ones
  code = code.replace(/<img src="https:\/\/img\.icons8\.com\/ios\/50\/475569\/calendar--v1\.png" [^>]+>/g, calendarIcon);
  code = code.replace(/<img src="https:\/\/img\.icons8\.com\/ios\/50\/475569\/stethoscope\.png" [^>]+>/g, doctorIcon);
  code = code.replace(/<img src="https:\/\/img\.icons8\.com\/ios\/50\/475569\/info\.png" [^>]+>/g, infoIcon);

  // Also replace any lingering old SVG doctorIcon definitions just in case
  code = code.replace(/const doctorIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const doctorIcon = `' + doctorIcon + '`;');

  fs.writeFileSync(filename, code);
};

updateFile('server.js');
updateFile('generate-preview.js');
console.log('Fixed Icons to SF Regular.');
