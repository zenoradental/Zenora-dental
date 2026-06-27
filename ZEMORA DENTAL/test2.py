import json

with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\extract.txt', 'r', encoding='utf-8') as f:
    content = f.read()

try:
    content = json.loads(content)
    with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Saved cleanly!")
except Exception as e:
    print(f"Failed: {e}")
