import os
import glob

css_link = '    <link href="assets/css/mobile-responsive.css" rel="stylesheet" type="text/css"/>\n'

html_files = glob.glob('*.html')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'mobile-responsive.css' in content:
        print(f"Skipping {file}, already added.")
        continue
        
    if '</head>' in content:
        content = content.replace('</head>', css_link + '</head>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected mobile CSS into {file}")
    else:
        print(f"Could not find </head> in {file}")

variant_html = glob.glob('variant-blue/*.html')
for file in variant_html:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'mobile-responsive.css' in content:
        print(f"Skipping {file}, already added.")
        continue
        
    css_link_variant = '    <link href="../assets/css/mobile-responsive.css" rel="stylesheet" type="text/css"/>\n'
    
    if '</head>' in content:
        content = content.replace('</head>', css_link_variant + '</head>')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected mobile CSS into {file}")
