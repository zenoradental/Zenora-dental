import os
import re

css_style = """        <style>
            /* Professional Layout for Service Details */
            .service-item_details {
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                gap: 4rem !important;
                margin-top: 2rem !important;
            }

            .service-thumbnail_wrap {
                flex: 1 !important;
                border-radius: 1rem !important;
                overflow: hidden !important;
                max-width: 50% !important;
                position: relative !important;
            }

            .service-thumbnail_wrap img {
                width: 100% !important;
                height: auto !important;
                display: block !important;
            }

            .service-tag_wrap {
                flex: 1 !important;
                display: flex !important;
                flex-wrap: wrap !important;
                gap: 1rem !important;
                position: relative !important;
            }

            @media screen and (max-width: 991px) {
                .service-item_details {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                }
                .service-thumbnail_wrap {
                    max-width: 100% !important;
                }
            }
        </style>"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the style block
    # Find the current style block
    style_pattern = re.compile(r'<style>.*?</style>', re.DOTALL)
    if style_pattern.search(content):
        content = style_pattern.sub(css_style, content)

    # 2. Remove the button-container blocks
    # We can use a regex that matches <div class="button-container"> until its closing </div>
    # The block looks like:
    # <div class="button-container">
    #     <a ...>
    #         <div ...>
    #             ...
    #         </div>
    #     </a>
    # </div>
    # Since it might have nested divs, regex is tricky. Let's find it by exact string or a simple nested search.
    # Actually, we can split by '<div class="button-container">'
    # and then find the corresponding matching closing </div>.
    
    while '<div class="button-container">' in content:
        start_idx = content.find('<div class="button-container">')
        # Find the matching closing div
        count = 0
        end_idx = start_idx
        while end_idx < len(content):
            if content[end_idx:end_idx+4] == '<div':
                count += 1
            elif content[end_idx:end_idx+5] == '</div':
                count -= 1
                if count == 0:
                    end_idx += 6 # length of </div>\n
                    break
            end_idx += 1
        
        # Remove the block
        content = content[:start_idx] + content[end_idx:]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

process_file(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\service.html")
process_file(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\variant-blue\service.html")
