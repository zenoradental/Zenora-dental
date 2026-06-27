import os
import glob

html_files = glob.glob('*.html') + glob.glob('variant-blue/*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = [line for line in lines if 'mobile-responsive.css' not in line]
    
    if len(lines) != len(new_lines):
        with open(file, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Reverted {file}")
