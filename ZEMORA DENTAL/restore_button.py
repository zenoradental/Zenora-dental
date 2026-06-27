import re

button_html = """                                <div class="button-container">
                                    <a data-wf--button-primary--variant="light-small" href="book-appointment.html" class="button_primary w-variant-fb89ee7f-8db1-8e54-55c6-075f0151c951 w-inline-block">
                                        <div class="button_inner">
                                            <div class="button-text_wrap">
                                                <div class="button_text">Get Appointment</div>
                                            </div>
                                            <div class="button-icon_group w-variant-fb89ee7f-8db1-8e54-55c6-075f0151c951">
                                                <div class="button-icon_wrap w-variant-fb89ee7f-8db1-8e54-55c6-075f0151c951">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                        <path d="M4.70139 0.75L10.5303 0.750201L10.5303 6.55165M0.530334 10.75L10.2896 0.990932" stroke="currentColor" stroke-width="1.5"></path>
                                                    </svg>
                                                </div>
                                                <div class="button-icon_wrap w-variant-fb89ee7f-8db1-8e54-55c6-075f0151c951 is-hover">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" vector-effect="non-scaling-stroke" preserveAspectRatio="none">
                                                        <path d="M4.70139 0.75L10.5303 0.750201L10.5303 6.55165M0.530334 10.75L10.2896 0.990932" stroke="currentColor" stroke-width="1.5"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>"""

def restore_button(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target = '<div class="navbar_button hide-mobile">'
    
    if target in content and button_html not in content:
        # Only replace the FIRST occurrence, which is in the header navbar
        content = content.replace(target, target + "\n" + button_html, 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Restored button in {filepath}")
    else:
        print(f"Skipped {filepath}")

restore_button(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\service.html")
restore_button(r"d:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\variant-blue\service.html")
