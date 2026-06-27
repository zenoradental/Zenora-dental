import codecs
import re

with open('book-appointment.html', 'r', encoding='utf-8') as f:
    c = f.read()

if c.startswith('"') and c.endswith('"'):
    c = c[1:-1]
    c = c.replace('\\n', '\n').replace('\\"', '"').replace('\\t', '\t').replace('\\\\', '\\')

with open('book-appointment.html', 'w', encoding='utf-8') as f:
    f.write(c)
