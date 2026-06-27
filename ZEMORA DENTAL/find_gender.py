import os

brain_dir = r'C:\Users\nmani\.gemini\antigravity-ide\brain'

for root, dirs, files in os.walk(brain_dir):
    if 'transcript.jsonl' in files:
        transcript_path = os.path.join(root, 'transcript.jsonl')
        with open(transcript_path, 'r', encoding='utf-8') as f:
            for line in f:
                if 'gender-select-wrapper' in line:
                    print(f"Found in {transcript_path}")
                    break
