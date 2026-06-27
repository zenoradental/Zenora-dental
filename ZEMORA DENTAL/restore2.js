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

    console.log('Searching', conv);
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
                 console.log('Found full write at', latestTime);
              }
              if (tc.name === 'multi_replace_file_content' && tc.args.TargetFile && tc.args.TargetFile.includes('book-appointment.html')) {
                 // if we want to reconstruct, it's hard. But maybe the last operation was a write_to_file?
              }
            }
          }
          if (obj.type === 'VIEW_FILE' || (obj.tool_calls && obj.tool_calls.some(t => t.name === 'view_file' && t.args.AbsolutePath.includes('book-appointment.html')))) {
              // Wait, view_file output is in the NEXT step usually, but we want the actual content.
          }
        } catch (e) {}
      }
    }
  }
  
  if (latestContent) {
      fs.writeFileSync('d:\\\\WEBSITES\\\\THE ZEHOSP\\\\ZEMORA DENTAL\\\\book-appointment.html', latestContent);
      console.log('Restored from write_to_file! Time:', latestTime);
  } else {
      console.log('Not found any write_to_file for book-appointment.html.');
  }
}

searchTranscripts();
