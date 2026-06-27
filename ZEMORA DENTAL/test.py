import json

transcript_path = r'C:\Users\nmani\.gemini\antigravity-ide\brain\b4fcf0a7-8a8d-4ad1-a926-b35d35bd90d2\.system_generated\logs\transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'book-appointment.html' in line and 'write_to_file' in line:
            obj = json.loads(line)
            for tc in obj.get('tool_calls', []):
                if tc.get('name') == 'write_to_file' and 'book-appointment.html' in tc.get('args', {}).get('TargetFile', ''):
                    content = tc['args']['CodeContent']
                    print(repr(content[:500]))
                    with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\extract.txt', 'w', encoding='utf-8') as out:
                        out.write(content)
