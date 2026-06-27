import json
import os

brain_dir = r'C:\Users\nmani\.gemini\antigravity-ide\brain'
latest_content = None
latest_time = ''

for root, dirs, files in os.walk(brain_dir):
    if 'transcript.jsonl' in files:
        transcript_path = os.path.join(root, 'transcript.jsonl')
        with open(transcript_path, 'r', encoding='utf-8') as f:
            for line in f:
                if 'book-appointment.html' in line and 'CodeContent' in line:
                    try:
                        obj = json.loads(line)
                        if 'tool_calls' in obj:
                            for tc in obj['tool_calls']:
                                if tc.get('name') == 'write_to_file':
                                    args = tc.get('args', {})
                                    if 'book-appointment.html' in args.get('TargetFile', ''):
                                        latest_content = args.get('CodeContent')
                                        latest_time = obj.get('created_at', '')
                    except Exception as e:
                        pass

if latest_content:
    if latest_content.startswith('"') and latest_content.endswith('"'):
        try:
            latest_content = json.loads(latest_content)
        except Exception:
            pass
    with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html', 'w', encoding='utf-8') as f:
        f.write(latest_content)
    print(f"Successfully restored book-appointment.html from {latest_time}")
else:
    print("Not found")
