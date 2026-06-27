const fs = require('fs');

const calendarIcon = `<img src="https://img.icons8.com/ios/50/475569/calendar--v1.png" alt="Calendar" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const doctorIcon = `<img src="https://img.icons8.com/ios/50/475569/stethoscope.png" alt="Doctor" style="width: 24px; height: 24px; display: block; border: 0;" />`;
const infoIcon = `<img src="https://img.icons8.com/ios/50/475569/info.png" alt="Info" style="width: 24px; height: 24px; display: block; border: 0;" />`;

const updateFile = (filename) => {
  if (!fs.existsSync(filename)) return;
  
  let code = fs.readFileSync(filename, 'utf8');
  
  // Replace SVG icons with PNG icons
  code = code.replace(/const calendarIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const calendarIcon = `' + calendarIcon + '`;');
  code = code.replace(/const doctorIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const doctorIcon = `' + doctorIcon + '`;');
  code = code.replace(/const infoIcon = `<svg[\s\S]*?<\/svg>`;/g, 'const infoIcon = `' + infoIcon + '`;');

  // Change the check from <svg to <img
  code = code.replace(/const isSvgIcon = imageUrl.trim\(\).startsWith\('<svg'\);/g, "const isSvgIcon = imageUrl.trim().startsWith('<img');");

  fs.writeFileSync(filename, code);
};

updateFile('server.js');
updateFile('generate-preview.js');
console.log('Fixed SVG to PNG.');
