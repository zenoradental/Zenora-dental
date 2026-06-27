import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the HTML in Step 2 to add Medical History and rename Notes to Symptoms
old_html = """                                <div class="field-group">
                                    <label for="field-notes">Notes (Optional)</label>
                                    <textarea id="field-notes" class="field-textarea" placeholder="Tell us about any specific concerns or requirements..." rows="6"></textarea>
                                </div>"""

new_html = """                                <div class="field-group" style="margin-bottom: 20px;">
                                    <label for="field-notes">Symptoms / Reason for Visit</label>
                                    <textarea id="field-notes" class="field-textarea" placeholder="Briefly describe your symptoms or reason for the appointment..." rows="4"></textarea>
                                </div>
                                <div class="field-group">
                                    <label for="field-medical-history">Medical History (Optional)</label>
                                    <textarea id="field-medical-history" class="field-textarea" placeholder="Any past surgeries, chronic conditions, or current medications?" rows="4"></textarea>
                                </div>"""

content = content.replace(old_html, new_html)

# 2. Update the Javascript payload to include medicalHistory
old_js = """                        time: document.getElementById('field-time').value,
                        notes: document.getElementById('field-notes').value
                    };"""

new_js = """                        time: document.getElementById('field-time').value,
                        notes: document.getElementById('field-notes').value,
                        medicalHistory: document.getElementById('field-medical-history').value
                    };"""

content = content.replace(old_js, new_js)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Medical History field and updated Symptoms label")
