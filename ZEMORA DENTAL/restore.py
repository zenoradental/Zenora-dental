import json
import os

transcript_path = r'C:\Users\nmani\.gemini\antigravity-ide\brain\fbad3945-890b-40bc-bfda-756fc816cf84\.system_generated\logs\transcript.jsonl'
latest_content = None

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
            except Exception as e:
                pass

if latest_content:
    with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html', 'w', encoding='utf-8') as f:
        f.write(latest_content)
    print("Successfully restored book-appointment.html")
else:
    print("Not found")
