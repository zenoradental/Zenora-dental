const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function searchTranscripts() {
  const brainDir = 'C:\\\\Users\\\\nmani\\\\.gemini\\\\antigravity-ide\\\\brain';
  const conversations = fs.readdirSync(brainDir).filter(f => fs.statSync(path.join(brainDir, f)).isDirectory());

  let latestContent = '';
  let latestTime = '';

  for (const conv of conversations) {
    const transcriptPath = path.join(brainDir, conv, '.system_generated', 'logs', 'transcript.jsonl');
    if (!fs.existsSync(transcriptPath)) continue;

    const fileStream = fs.createReadStream(transcriptPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    for await (const line of rl) {
      if (line.includes('book-appointment.html')) {
        try {
          const obj = JSON.parse(line);
          if (obj.tool_calls) {
            for (const tc of obj.tool_calls) {
              if (tc.name === 'write_to_file' && tc.args.TargetFile && tc.args.TargetFile.includes('book-appointment.html')) {
                 latestContent = tc.args.CodeContent;
                 latestTime = obj.created_at;
              }
            }
          }
        } catch (e) {}
      }
    }
  }
  
  if (latestContent) {
      // Decode the string if it's double-encoded
      if (latestContent.startsWith('"') && latestContent.endsWith('"')) {
          try {
              latestContent = JSON.parse(latestContent);
          } catch(e) {
              console.log('JSON.parse failed on the inner string, applying manual replace');
              latestContent = latestContent
                  .slice(1, -1) // remove quotes
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\t/g, '\t')
                  .replace(/\\\\/g, '\\');
          }
      }
      fs.writeFileSync('d:\\\\WEBSITES\\\\THE ZEHOSP\\\\ZEMORA DENTAL\\\\book-appointment.html', latestContent);
      console.log('Restored from write_to_file! Time:', latestTime);
  } else {
      console.log('Not found any write_to_file for book-appointment.html.');
  }
}

searchTranscripts();
