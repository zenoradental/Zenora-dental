import os

brain_dir = r'C:\Users\nmani\.gemini\antigravity-ide\brain'
output_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\patches_raw.txt'

with open(output_path, 'w', encoding='utf-8') as out_f:
    for root, dirs, files in os.walk(brain_dir):
        if 'transcript.jsonl' in files:
            transcript_path = os.path.join(root, 'transcript.jsonl')
            with open(transcript_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if 'book-appointment.html' in line and 'Replace select dropdown with an inline grid of clickable service cards' in line:
                        out_f.write(line + "\n")
                    if 'book-appointment.html' in line and 'Replace date and time native inputs with custom radio card grids' in line:
                        out_f.write(line + "\n")
