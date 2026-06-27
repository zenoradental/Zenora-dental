const fs = require('fs');

// 1. Read both files
const previewCode = fs.readFileSync('generate-preview.js', 'utf8');
const serverCode = fs.readFileSync('server.js', 'utf8');

// 2. Extract generateEmailHTML from preview
const startIdx = previewCode.indexOf('const generateEmailHTML =');
const endIdx = previewCode.indexOf('};', startIdx) + 2;
const generateEmailFunction = previewCode.substring(startIdx, endIdx);

// 3. Replace generateEmailHTML in server.js
const serverStartIdx = serverCode.indexOf('const generateEmailHTML =');
const serverEndIdx = serverCode.indexOf('};', serverStartIdx) + 2;
let newServerCode = serverCode.substring(0, serverStartIdx) + generateEmailFunction + serverCode.substring(serverEndIdx);

// 4. Icons definitions
const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>`;
const doctorIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`;
const infoIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 100%; height: 100%;"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`;

// Inject icon definitions before they are used (right after generateEmailHTML is good)
newServerCode = newServerCode.replace('};\n\n// Appointment Schema', '};\n\nconst calendarIcon = `' + calendarIcon + '`;\nconst doctorIcon = `' + doctorIcon + '`;\nconst infoIcon = `' + infoIcon + '`;\n\n// Appointment Schema');

// 5. Replace image URLs with icon variables in the API endpoints
newServerCode = newServerCode.replace(/'https:\/\/zenoradentalofficial\.netlify\.app\/assets\/img\/gen_hero-2\.jpg'/g, 'calendarIcon');
newServerCode = newServerCode.replace(/'https:\/\/zenoradentalofficial\.netlify\.app\/assets\/img\/gen_team-image-1\.jpg'/g, 'doctorIcon');
newServerCode = newServerCode.replace(/'https:\/\/zenoradentalofficial\.netlify\.app\/assets\/img\/gen_about-hero-image\.jpg'/g, 'infoIcon');

fs.writeFileSync('server.js', newServerCode);
console.log('Successfully updated server.js with Option 5C and SVG icons!');
