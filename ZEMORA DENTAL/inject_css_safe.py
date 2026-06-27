import os
import glob

html_files = glob.glob('*.html') + glob.glob('variant-blue/*.html')
css_link = '    <link href="assets/css/mobile-responsive.css" rel="stylesheet" type="text/css"/>\n'
css_link_variant = '    <link href="../assets/css/mobile-responsive.css" rel="stylesheet" type="text/css"/>\n'

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'mobile-responsive.css' not in content:
        link_to_use = css_link_variant if 'variant-blue' in file else css_link
        content = content.replace('</head>', f"{link_to_use}</head>")
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Injected into {file}")
