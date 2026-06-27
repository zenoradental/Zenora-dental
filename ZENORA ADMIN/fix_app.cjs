const fs = require('fs');
const file = 'd:/WEBSITES/THE ZEHOSP/ZEMORA ADMIN/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const fixes = [
  { lineMatch: /fetch\(http:\/\/:3001\)/, context: "currentPage === 'settings'", replace: 'fetch(`http://${window.location.hostname}:3001/api/admins`)' },
  { lineMatch: /fetch\(http:\/\/:3001\)/, context: "fetchAppointments = async", replace: 'fetch(`http://${window.location.hostname}:3001/api/appointments`)' },
  { lineMatch: /fetch\(http:\/\/:3001\)/, context: "fetchSettingsAndDoctors", replace: 'fetch(`http://${window.location.hostname}:3001/api/settings`)' },
  { lineMatch: /fetch\(http:\/\/:3001\)/, context: "setDoctors", replace: 'fetch(`http://${window.location.hostname}:3001/api/doctors`)' },
  { lineMatch: /fetch\(http:\/\/:3001, \{/, context: "e.preventDefault", replace: 'fetch(`http://${window.location.hostname}:3001/api/auth/login`, {' },
  { lineMatch: /fetch\(`http:\/\/:3001\/api\/appointments\/\$\{appointmentId\}\/status`, \{/, context: "PATCH", replace: 'fetch(`http://${window.location.hostname}:3001/api/appointments/${appointmentId}/status`, {' },
  { lineMatch: /fetch\(http:\/\/:3001, \{/, context: "'DELETE'", replace: 'fetch(`http://${window.location.hostname}:3001/api/appointments`, {' },
  { lineMatch: /fetch\(http:\/\/:3001, \{/, context: "setAdmins\\(", replace: 'fetch(`http://${window.location.hostname}:3001/api/admins`, {' },
  { lineMatch: /fetch\(`http:\/\/:3001\/api\/admins\/\$\{id\}`, \{ method: 'DELETE' \}\);/, context: "DELETE", replace: 'fetch(`http://${window.location.hostname}:3001/api/admins/${id}`, { method: \'DELETE\' });' },
  { lineMatch: /fetch\(`http:\/\/:3001\/api\/admins\/\$\{id\}\/role`, \{/, context: "PATCH", replace: 'fetch(`http://${window.location.hostname}:3001/api/admins/${id}/role`, {' },
  { lineMatch: /fetch\(`http:\/\/:3001\/api\/admins\/\$\{id\}\/password`, \{/, context: "PATCH", replace: 'fetch(`http://${window.location.hostname}:3001/api/admins/${id}/password`, {' },
  { lineMatch: /fetch\(http:\/\/:3001, \{/, context: "systemSettings", replace: 'fetch(`http://${window.location.hostname}:3001/api/settings`, {' },
  { lineMatch: /fetch\(http:\/\/:3001, \{/, context: "setDoctors", replace: 'fetch(`http://${window.location.hostname}:3001/api/doctors`, {' },
  { lineMatch: /fetch\(`http:\/\/:3001\/api\/doctors\/\$\{id\}`, \{ method: 'DELETE' \}\);/, context: "DELETE", replace: 'fetch(`http://${window.location.hostname}:3001/api/doctors/${id}`, { method: \'DELETE\' });' }
];

let currentIndex = 0;
for (let i = 0; i < lines.length; i++) {
  if (currentIndex < fixes.length) {
    // Check if current line matches what we expect
    // We will do a fuzzy match by checking if the next match occurs around here.
    // Actually, let's just do a greedy sequential match over lines.
    if (lines[i].match(fixes[currentIndex].lineMatch)) {
      lines[i] = lines[i].replace(fixes[currentIndex].lineMatch, fixes[currentIndex].replace);
      currentIndex++;
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log(`Applied ${currentIndex} fixes.`);
