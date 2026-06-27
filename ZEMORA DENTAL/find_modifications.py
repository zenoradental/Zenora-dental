import json
import os

brain_dir = r'C:\Users\nmani\.gemini\antigravity-ide\brain'

for root, dirs, files in os.walk(brain_dir):
    if 'transcript.jsonl' in files:
        transcript_path = os.path.join(root, 'transcript.jsonl')
        with open(transcript_path, 'r', encoding='utf-8') as f:
            for line in f:
                if 'book-appointment.html' in line:
                    try:
                        obj = json.loads(line)
                        if 'tool_calls' in obj:
                            for tc in obj['tool_calls']:
                                name = tc.get('name', '')
                                if name in ['replace_file_content', 'multi_replace_file_content']:
                                    args = tc.get('args', {})
                                    if 'book-appointment.html' in args.get('TargetFile', ''):
                                        print(f"[{name}] {args.get('Description', '')} | {args.get('Instruction', '')}")
                    except:
                        pass
