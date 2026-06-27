import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'
css_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\assets\css\booking.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove Flatpickr from head
content = content.replace('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">\n', '')
content = content.replace('        <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>\n', '')

# 2. Revert the Date Field HTML to the scrolling container
old_date_html = """                                    <div class="field-group">
                                        <label for="field-date">Preferred Date</label>
                                        <div class="field-input-wrap">
                                            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                            <input type="text" id="field-date" class="field-input has-icon" placeholder="Select a preferred date" readonly style="background-color: #fff; cursor: pointer;">
                                        </div>
                                    </div>"""

new_date_html = """                                    <div class="field-group">
                                        <label style="margin-bottom: 12px; display: block;">Preferred Date</label>
                                        <input type="hidden" id="field-date" value="">
                                        <div class="dates-scroll" id="dates-container" style="padding-bottom: 12px;">
                                            <!-- JS populated -->
                                        </div>
                                    </div>"""

content = content.replace(old_date_html, new_date_html)

# 3. Replace the Flatpickr JS with the new Pill JS
old_js = """                // Initialize Flatpickr for Popup Calendar
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

new_js = """                // Generate Sleek Date Pills
                const datesContainer = document.getElementById('dates-container');
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                let dateHTML = '';
                
                let d = new Date();
                for(let i=0; i<14; i++) {
                    d.setDate(d.getDate() + 1);
                    if (d.getDay() === 0 || d.getDay() === 6) continue;
                    const val = d.toISOString().split('T')[0];
                    const mo = monthNames[d.getMonth()];
                    const da = d.getDate();
                    const dw = dayNames[d.getDay()];
                    
                    dateHTML += `
                        <label class="date-pill">
                            <input type="radio" name="date" value="${val}" class="date-radio">
                            <div class="date-pill-inner">
                                <span class="weekday">${dw}</span>
                                <span class="day">${da}</span>
                                <span class="month">${mo}</span>
                            </div>
                        </label>
                    `;
                }
                dateHTML += `
                    <label class="date-pill" id="custom-date-btn">
                        <input type="radio" name="date" value="custom" class="date-radio" id="custom-date-radio">
                        <div class="date-pill-inner custom-pill">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 6px;"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                            <span style="font-size: 12px; font-weight: 600;">More</span>
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
                        document.querySelector('#custom-date-btn .date-pill-inner').innerHTML = `
                            <span class="weekday">${dayNames[dateObj.getDay()]}</span>
                            <span class="day">${dateObj.getDate()}</span>
                            <span class="month">${monthNames[dateObj.getMonth()]}</span>
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

content = content.replace(old_js, new_js)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 4. Inject CSS for the new pills
with open(css_path, 'a', encoding='utf-8') as f:
    f.write('''
/* Premium Date Pills Styling */
.date-pill {
    cursor: pointer;
    position: relative;
    display: block;
    flex-shrink: 0;
}
.date-pill-inner {
    padding: 16px 12px;
    width: 64px;
    height: 84px;
    border-radius: 100px; /* Fully rounded pill shape */
    background: #f8fafc; /* Soft modern grey */
    border: 2px solid transparent;
    color: #64748b;
    text-align: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.date-pill-inner .weekday {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}
.date-pill-inner .day {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1;
    margin-bottom: 4px;
}
.date-pill-inner .month {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}
.date-pill:hover .date-pill-inner {
    background: #f1f5f9;
    transform: translateY(-2px);
}
.date-radio:checked + .date-pill-inner {
    background: #14b8a6;
    color: #ffffff;
    box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.3);
    transform: translateY(-4px);
}
.date-radio:checked + .date-pill-inner .day {
    color: #ffffff;
}
.custom-pill {
    background: #ffffff;
    border: 2px dashed #cbd5e1;
}
.date-pill:hover .custom-pill {
    border-color: #94a3b8;
    background: #ffffff;
}
.date-radio:checked + .custom-pill {
    border: 2px solid #14b8a6;
}
''')

print("Applied Sleek Date Pills UI")
