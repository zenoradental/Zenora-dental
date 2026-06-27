import json

transcript_path = r'C:\Users\nmani\.gemini\antigravity-ide\brain\fbad3945-890b-40bc-bfda-756fc816cf84\.system_generated\logs\transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'gender-select-wrapper' in line:
            try:
                obj = json.loads(line)
                if 'tool_calls' in obj:
                    for tc in obj['tool_calls']:
                        name = tc.get('name', '')
                        if name in ['replace_file_content', 'multi_replace_file_content']:
                            args = tc.get('args', {})
                            if 'book-appointment.html' in args.get('TargetFile', ''):
                                print("FOUND A REPLACEMENT!")
                                with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\gender_replacement.json', 'w', encoding='utf-8') as out:
                                    json.dump(args, out, indent=2)
            except Exception as e:
                pass
