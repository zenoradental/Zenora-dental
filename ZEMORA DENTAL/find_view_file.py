import json
import os

brain_dir = r'C:\Users\nmani\.gemini\antigravity-ide\brain'
output_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\last_view_file.txt'

max_len = 0
best_content = ""

for root, dirs, files in os.walk(brain_dir):
    if 'transcript.jsonl' in files:
        transcript_path = os.path.join(root, 'transcript.jsonl')
        with open(transcript_path, 'r', encoding='utf-8') as f:
            for line in f:
                if 'book-appointment.html' in line:
                    try:
                        obj = json.loads(line)
                        if 'content' in obj and 'File Path:' in obj['content'] and 'book-appointment.html' in obj['content']:
                            if len(obj['content']) > max_len:
                                max_len = len(obj['content'])
                                best_content = obj['content']
                    except:
                        pass

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(best_content)
