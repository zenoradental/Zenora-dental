with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\extract.txt', 'r', encoding='utf-8') as f:
    content = f.read()

if content.startswith('"') and content.endswith('"'):
    content = content[1:-1]
    
content = content.replace('\\n', '\n')
content = content.replace('\\"', '"')
content = content.replace('\\t', '\t')
content = content.replace('\\\\', '\\')

with open(r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved via manual unescaping!")
