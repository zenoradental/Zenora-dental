import re

css_style = """        <style>
            /* Professional Layout for Service Details */
            .service-item_details {
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 2rem !important;
                margin-top: 2rem !important;
                width: 100% !important;
            }

            .service-thumbnail_wrap {
                width: 100% !important;
                border-radius: 1.5rem !important;
                overflow: hidden !important;
            }

            .service-thumbnail_wrap img {
                width: 100% !important;
                height: 400px !important;
                object-fit: cover !important;
                display: block !important;
            }

            .service-tag_wrap {
                width: 100% !important;
                display: flex !important;
                flex-wrap: wrap !important;
                flex-direction: row !important;
                gap: 1rem !important;
            }
        </style>"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    style_pattern = re.compile(r'<style>.*?</style>', re.DOTALL)
    if style_pattern.search(content):
        content = style_pattern.sub(css_style, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

process_file(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\service.html")
process_file(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\variant-blue\service.html")
