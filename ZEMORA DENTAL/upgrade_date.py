import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Flatpickr CDN to head
if "flatpickr" not in content:
    head_replacement = """        <link href="assets/img/favicon.svg" rel="shortcut icon" type="image/x-icon"/>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>"""
    content = content.replace('<link href="assets/img/favicon.svg" rel="shortcut icon" type="image/x-icon"/>', head_replacement)

# 2. Update the Date Field HTML
old_date_html = """                                    <div class="field-group">
                                        <label>Preferred Date</label>
                                        <input type="hidden" id="field-date" value="">
                                        <div class="dates-scroll" id="dates-container">
                                            <!-- JS populated -->
                                        </div>
                                    </div>"""

new_date_html = """                                    <div class="field-group" style="margin-bottom: 24px;">
                                        <label style="margin-bottom: 12px; display: block;">Preferred Date</label>
                                        <div class="date-picker-wrapper">
                                            <input type="text" id="field-date" class="field-input" placeholder="Select a date" readonly style="display: none;">
                                        </div>
                                    </div>"""

content = content.replace(old_date_html, new_date_html)

# 3. Update the JavaScript
# We need to remove the loop that generates Date Cards and replace it with Flatpickr initialization
old_js = """                // Generate Date Cards
                const datesContainer = document.getElementById('dates-container');
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let dateHTML = '';
                
                let d = new Date();
                for(let i=0; i<14; i++) {
                    d.setDate(d.getDate() + 1);
                    if (d.getDay() === 0 || d.getDay() === 6) continue;
                    const val = d.toISOString().split('T')[0];
                    const mo = monthNames[d.getMonth()];
                    const da = d.getDate();
                    dateHTML += `
                        <label class="service-card" style="flex-shrink: 0;">
                            <input type="radio" name="date" value="${val}" class="date-radio">
                            <div class="date-card-inner">
                                <span class="month">${mo}</span>
                                <span class="day">${da}</span>
                            </div>
                        </label>
                    `;
                }
                dateHTML += `
                    <label class="service-card" style="flex-shrink: 0;" id="custom-date-btn">
                        <input type="radio" name="date" value="custom" class="date-radio" id="custom-date-radio">
                        <div class="date-card-inner" style="padding: 12px 16px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 4px; color: #94a3b8;"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                            <span style="font-size: 13px;">Other Date</span>
                        </div>
                        <input type="date" id="hidden-custom-date" style="position:absolute; bottom:0; left:0; opacity:0; pointer-events:none; height:0;" min="${new Date().toISOString().split('T')[0]}">
                    </label>
                `;
                datesContainer.innerHTML = dateHTML;

                const hiddenPicker = document.getElementById('hidden-custom-date');
                hiddenPicker.addEventListener('change', (e) => {
                    if (e.target.value) {
                        document.getElementById('field-date').value = e.target.value;
                        const dateObj = new Date(e.target.value);
                        document.querySelector('#custom-date-btn .date-card-inner').innerHTML = `
                            <span class="month">${monthNames[dateObj.getMonth()]}</span>
                            <span class="day">${dateObj.getDate()}</span>
                        `;
                        validateStep();
                    }
                });

                document.addEventListener('click', (e) => {
                    if (e.target.closest('#custom-date-btn')) {
                        if (typeof hiddenPicker.showPicker === 'function') {
                            try { hiddenPicker.showPicker(); } catch(err) { hiddenPicker.click(); }
                        } else {
                            hiddenPicker.click();
                        }
                    }
                });"""

new_js = """                // Initialize Flatpickr for Inline Calendar
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

content = content.replace(old_js, new_js)

# Also remove the listener for `date-radio` in the generic event listener
content = re.sub(r"""                    if \(e\.target\.classList\.contains\('date-radio'\)\) \{
                        if \(e\.target\.value !== 'custom'\) \{
                            document\.getElementById\('field-date'\)\.value = e\.target\.value;
                            validateStep\(\);
                        \}
                    \}""", "", content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Inject Flatpickr custom CSS to booking.css
css_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\assets\css\booking.css'
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* Premium Flatpickr Theme Customization */
.flatpickr-calendar {
    font-family: 'Sora', sans-serif !important;
    box-shadow: 0 4px 15px -3px rgba(0,0,0,0.05), 0 0 0 1px #e2e8f0 !important;
    border: none !important;
    border-radius: 12px !important;
    padding: 10px !important;
    width: 100% !important;
    max-width: 320px !important;
    margin: 0 !important;
}
.flatpickr-months .flatpickr-month {
    height: 48px !important;
}
.flatpickr-current-month {
    font-size: 110% !important;
    font-weight: 600 !important;
}
.flatpickr-day.selected, 
.flatpickr-day.startRange, 
.flatpickr-day.endRange, 
.flatpickr-day.selected.inRange, 
.flatpickr-day.startRange.inRange, 
.flatpickr-day.endRange.inRange, 
.flatpickr-day.selected:focus, 
.flatpickr-day.startRange:focus, 
.flatpickr-day.endRange:focus, 
.flatpickr-day.selected:hover, 
.flatpickr-day.startRange:hover, 
.flatpickr-day.endRange:hover, 
.flatpickr-day.selected.prevMonthDay, 
.flatpickr-day.startRange.prevMonthDay, 
.flatpickr-day.endRange.prevMonthDay, 
.flatpickr-day.selected.nextMonthDay, 
.flatpickr-day.startRange.nextMonthDay, 
.flatpickr-day.endRange.nextMonthDay {
    background: #14b8a6 !important;
    border-color: #14b8a6 !important;
    font-weight: 600 !important;
}
.flatpickr-day:hover {
    background: #f1f5f9 !important;
    border-color: #f1f5f9 !important;
}
.flatpickr-weekday {
    color: #94a3b8 !important;
    font-weight: 600 !important;
}
.date-picker-wrapper {
    display: flex;
    justify-content: flex-start;
}
''')

print("Update complete")
