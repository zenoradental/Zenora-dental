import os

media_query = """        <style>
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

            /* Mobile Optimization */
            @media screen and (max-width: 767px) {
                .service-item_details {
                    gap: 1rem !important;
                    margin-top: 1rem !important;
                }
                .service-thumbnail_wrap {
                    border-radius: 1rem !important;
                }
                .service-thumbnail_wrap img {
                    height: 220px !important; /* Smaller image height for mobile */
                }
                .service-tag_wrap {
                    gap: 0.5rem !important;
                }
                /* Tag sizes could also be slightly smaller if needed */
            }
            @media screen and (max-width: 479px) {
                .service-thumbnail_wrap img {
                    height: 180px !important; /* Even smaller for very small screens */
                }
            }
        </style>"""

def update_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    start_str = '        <style>\n            /* Professional Layout for Service Details */'
    end_str = '        </style>'
    
    if start_str in content:
        start_idx = content.find(start_str)
        end_idx = content.find(end_str, start_idx) + len(end_str)
        content = content[:start_idx] + media_query + content[end_idx:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated CSS in {filepath}")
    else:
        print(f"Could not find style block in {filepath}")

update_css(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\service.html")
update_css(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\variant-blue\service.html")
