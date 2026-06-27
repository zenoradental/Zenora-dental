import os

# Original correct head tags from variant-blue (with adjusted css version for service.html if needed)
correct_head_middle = """        <meta content="Zenora Dental is a modern dental clinic offering gentle, expert care &#x2014; from preventive checkups and cosmetic dentistry to restorative treatments and orthodontics. Book your visit today." name="twitter:description"/>
        <meta content="assets/img/gen_dentist-examining-patients-teeth-close-up_1.jpg" name="twitter:image"/>
        <meta property="og:type" content="website"/>
        <meta content="summary_large_image" name="twitter:card"/>
        <meta content="width=device-width, initial-scale=1" name="viewport"/>
        <link href="assets/css/zenora.css?v=20260623a" rel="stylesheet" type="text/css"/>
        <style>
            /* Professional Layout for Service Details */
            .service-item_details {
                display: grid !important;
                grid-template-columns: 1fr 1fr;
                grid-template-areas: 
                    "image tags"
                    "image button";
                gap: 2rem 3rem;
                align-items: center;
                margin-top: 2rem;
            }

            .service-item_details > .service-thumbnail_wrap {
                grid-area: image;
                border-radius: 1rem;
                overflow: hidden;
                height: 100%;
                min-height: 250px;
                display: flex;
            }

            .service-item_details > .service-thumbnail_wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .service-item_details > .service-tag_wrap {
                grid-area: tags;
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-self: end;
            }

            .service-item_details > .button-container {
                grid-area: button;
                align-self: start;
            }

            @media screen and (max-width: 991px) {
                .service-item_details {
                    grid-template-columns: 1fr !important;
                    grid-template-areas: 
                        "image"
                        "tags"
                        "button" !important;
                    gap: 1.5rem;
                }
            }
        </style>
        <link href="https://fonts.googleapis.com" rel="preconnect"/>
        <link href="https://fonts.gstatic.com" rel="preconnect"/>
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" type="text/javascript"></script>
"""

# Fix service.html
service_path = r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\service.html"
with open(service_path, "r", encoding="utf-8") as f:
    content = f.read()

# The broken part in service.html currently has:
#         <meta content="Our Services | Zenora Dental" name="twitter:title"/>
#             WebFont.load({
search_broken = '        <meta content="Our Services | Zenora Dental" name="twitter:title"/>\n            WebFont.load({'
replace_fixed = '        <meta content="Our Services | Zenora Dental" name="twitter:title"/>\n' + correct_head_middle + '        <script type="text/javascript">\n            WebFont.load({'

if search_broken in content:
    content = content.replace(search_broken, replace_fixed)
    with open(service_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed service.html")
else:
    print("Could not find the broken part in service.html")

# Fix variant-blue/service.html
variant_path = r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\variant-blue\service.html"
with open(variant_path, "r", encoding="utf-8") as f:
    v_content = f.read()

empty_style_block = "        <style>\n            \n        </style>"
if empty_style_block in v_content:
    v_content = v_content.replace(empty_style_block, correct_head_middle.split('<link href="assets/css/zenora')[0] + empty_style_block) # actually I just want to replace the style block
    
    # Just replace the style block
    style_replacement = """        <style>
            /* Professional Layout for Service Details */
            .service-item_details {
                display: grid !important;
                grid-template-columns: 1fr 1fr;
                grid-template-areas: 
                    "image tags"
                    "image button";
                gap: 2rem 3rem;
                align-items: center;
                margin-top: 2rem;
            }

            .service-item_details > .service-thumbnail_wrap {
                grid-area: image;
                border-radius: 1rem;
                overflow: hidden;
                height: 100%;
                min-height: 250px;
                display: flex;
            }

            .service-item_details > .service-thumbnail_wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .service-item_details > .service-tag_wrap {
                grid-area: tags;
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-self: end;
            }

            .service-item_details > .button-container {
                grid-area: button;
                align-self: start;
            }

            @media screen and (max-width: 991px) {
                .service-item_details {
                    grid-template-columns: 1fr !important;
                    grid-template-areas: 
                        "image"
                        "tags"
                        "button" !important;
                    gap: 1.5rem;
                }
            }
        </style>"""
    
    v_content = v_content.replace(empty_style_block, style_replacement)
    with open(variant_path, "w", encoding="utf-8") as f:
        f.write(v_content)
    print("Fixed variant-blue/service.html")
else:
    print("Could not find the empty style block in variant-blue/service.html")
