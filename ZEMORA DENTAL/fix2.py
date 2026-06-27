import json

with open('book-appointment.html', 'r', encoding='utf-8') as f:
    c = f.read()

try:
    c = json.loads(c)
except Exception as e:
    print(e)
    pass

with open('book-appointment.html', 'w', encoding='utf-8') as f:
    f.write(c)
