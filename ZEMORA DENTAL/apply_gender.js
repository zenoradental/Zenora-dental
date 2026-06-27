const fs = require('fs');
const args = JSON.parse(fs.readFileSync('gender_replacement.json', 'utf8'));
let content = fs.readFileSync('book-appointment.html', 'utf8');

const chunks = JSON.parse(args.ReplacementChunks);
for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (content.includes(chunk.TargetContent)) {
        content = content.replace(chunk.TargetContent, chunk.ReplacementContent);
        console.log(`Chunk ${i} replaced successfully!`);
    } else {
        console.log(`Chunk ${i} TargetContent not found!`);
        // save the target content to debug
        fs.writeFileSync(`chunk_${i}_target.txt`, chunk.TargetContent);
    }
}

fs.writeFileSync('book-appointment.html', content);
