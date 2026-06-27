import json
import os

brain_dir = r'C:\Users\nmani\.gemini\antigravity-ide\brain'
output_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\patches.txt'

with open(output_path, 'w', encoding='utf-8') as out_f:
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
                                        if isinstance(args, str):
                                            try:
                                                args = json.loads(args)
                                            except:
                                                pass
                                        
                                        if isinstance(args, dict):
                                            target_file = args.get('TargetFile', '')
                                            if 'book-appointment.html' in target_file:
                                                desc = args.get('Description', '')
                                                
                                                if 'cards' in desc.lower() or 'grid' in desc.lower() or 'date' in desc.lower():
                                                    out_f.write(f"=== {desc} ===\n")
                                                    chunks = args.get('ReplacementChunks', [])
                                                    for idx, chunk in enumerate(chunks):
                                                        out_f.write(f"CHUNK {idx+1}\n")
                                                        out_f.write("--- TARGET ---\n")
                                                        out_f.write(str(chunk.get('TargetContent', '')) + "\n")
                                                        out_f.write("--- REPLACEMENT ---\n")
                                                        out_f.write(str(chunk.get('ReplacementContent', '')) + "\n")
                                                    if not chunks and 'TargetContent' in args:
                                                        out_f.write("--- TARGET ---\n")
                                                        out_f.write(str(args.get('TargetContent', '')) + "\n")
                                                        out_f.write("--- REPLACEMENT ---\n")
                                                        out_f.write(str(args.get('ReplacementContent', '')) + "\n")
                        except Exception as e:
                            pass
