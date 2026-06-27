const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/<button class="step-btn active" id="step-btn-0">/g, '<button type="button" class="step-btn active" id="step-btn-0">');
  content = content.replace(/<button class="step-btn" id="step-btn-1">/g, '<button type="button" class="step-btn" id="step-btn-1">');
  content = content.replace(/<button class="step-btn" id="step-btn-2">/g, '<button type="button" class="step-btn" id="step-btn-2">');
  content = content.replace(/<button class="btn-book btn-book--outline" id="btn-back" style="display:none;" onclick="goBack\(\)">/g, '<button type="button" class="btn-book btn-book--outline" id="btn-back" style="display:none;" onclick="goBack()">');
  content = content.replace(/<button class="btn-book btn-book--primary" id="btn-next" disabled onclick="goNext\(\)">/g, '<button type="button" class="btn-book btn-book--primary" id="btn-next" disabled onclick="goNext()">');
  content = content.replace(/<button class="btn-book btn-book--primary" onclick="window\.location\.reload\(\)">/g, '<button type="button" class="btn-book btn-book--primary" onclick="window.location.reload()">');
  
  content = content.replace(/<button onclick="checkStatus\(\)">/g, '<button type="button" onclick="checkStatus()">');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}

fixFile('book-appointment.html');
fixFile('check-status.html');
