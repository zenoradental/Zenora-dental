const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\nmani\\.gemini\\antigravity-ide\\brain\\fbad3945-890b-40bc-bfda-756fc816cf84\\.system_generated\\logs\\transcript.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let latestContent = '';
  for await (const line of rl) {
    if (line.includes('book-appointment.html') && line.includes('CodeContent')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (const tc of obj.tool_calls) {
            if (tc.name === 'write_to_file' && tc.args.TargetFile && tc.args.TargetFile.includes('book-appointment.html')) {
               latestContent = tc.args.CodeContent;
            }
          }
        }
      } catch (e) {}
    }
  }
  
  if (latestContent) {
      fs.writeFileSync('d:\\WEBSITES\\THE ZEHOSP\\ZEMORA DENTAL\\book-appointment.html', latestContent);
      console.log('Restored from write_to_file!');
  } else {
      console.log('Not found in write_to_file.');
  }
}

processLineByLine();
