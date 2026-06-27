import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_code = "gender: document.getElementById('field-gender').value,"
new_code = "gender: genderSelectedValue,"

content = content.replace(old_code, new_code)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed the missing field-gender ID bug")
