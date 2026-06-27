import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the HTML
old_date_html = """                                    <div class="field-group" style="margin-bottom: 24px;">
                                        <label style="margin-bottom: 12px; display: block;">Preferred Date</label>
                                        <div class="date-picker-wrapper">
                                            <input type="text" id="field-date" class="field-input" placeholder="Select a date" readonly style="display: none;">
                                        </div>
                                    </div>"""

new_date_html = """                                    <div class="field-group">
                                        <label for="field-date">Preferred Date</label>
                                        <div class="field-input-wrap">
                                            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                            <input type="text" id="field-date" class="field-input has-icon" placeholder="Select a preferred date" readonly style="background-color: #fff; cursor: pointer;">
                                        </div>
                                    </div>"""

content = content.replace(old_date_html, new_date_html)

# Replace the JS
old_js = """                // Initialize Flatpickr for Inline Calendar
                flatpickr("#field-date", {
                    inline: true,
                    minDate: "today",
                    disable: [
                        function(date) {
                            // disable weekends
                            return (date.getDay() === 0 || date.getDay() === 6);
                        }
                    ],
                    onChange: function(selectedDates, dateStr, instance) {
                        validateStep();
                    }
                });"""

new_js = """                // Initialize Flatpickr for Popup Calendar
                flatpickr("#field-date", {
                    minDate: "today",
                    disable: [
                        function(date) {
                            // disable weekends
                            return (date.getDay() === 0 || date.getDay() === 6);
                        }
                    ],
                    dateFormat: "F j, Y", // e.g., "June 24, 2026"
                    onChange: function(selectedDates, dateStr, instance) {
                        validateStep();
                    }
                });"""

content = content.replace(old_js, new_js)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Changed Flatpickr to Popup mode")
