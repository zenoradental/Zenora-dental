import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the HTML to use the services-grid for dates
old_date_html = """                                    <div class="field-group">
                                        <label style="margin-bottom: 12px; display: block;">Preferred Date</label>
                                        <input type="hidden" id="field-date" value="">
                                        <div class="dates-scroll" id="dates-container" style="padding-bottom: 12px;">
                                            <!-- JS populated -->
                                        </div>
                                    </div>"""

new_date_html = """                                    <div class="field-group">
                                        <label>Preferred Date</label>
                                        <input type="hidden" id="field-date" value="">
                                        <div class="services-grid time-grid" id="dates-container">
                                            <!-- JS populated -->
                                        </div>
                                    </div>"""
content = content.replace(old_date_html, new_date_html)

# 2. Update the JS to generate service-card style cards for dates
old_js = """                // Generate Sleek Date Pills
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

new_js = """                // Generate Date Cards in a Grid matching Time
                const datesContainer = document.getElementById('dates-container');
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                let dateHTML = '';
                
                let d = new Date();
                for(let i=0; i<11; i++) { // Let's do 11 cards so with "Other" it makes a perfect 12 (4 rows of 3)
                    d.setDate(d.getDate() + 1);
                    if (d.getDay() === 0 || d.getDay() === 6) continue;
                    const val = d.toISOString().split('T')[0];
                    const mo = monthNames[d.getMonth()];
                    const da = d.getDate();
                    
                    dateHTML += `
                        <label class="service-card">
                            <input type="radio" name="date" value="${val}" class="date-radio">
                            <div class="service-card-inner time-card-inner">${mo} ${da}</div>
                        </label>
                    `;
                }
                dateHTML += `
                    <label class="service-card" id="custom-date-btn">
                        <input type="radio" name="date" value="custom" class="date-radio" id="custom-date-radio">
                        <div class="service-card-inner time-card-inner" style="display:flex; align-items:center; justify-content:center; gap:6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                            Other
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
                        document.querySelector('#custom-date-btn .service-card-inner').innerHTML = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
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

print("Changed Date selection to match Time Grid")
