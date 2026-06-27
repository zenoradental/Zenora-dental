import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace HTML
html_old = """                                <div class="field-group">
                                    <label for="field-service">Service Type</label>
                                    <select id="field-service" class="field-select">
                                        <option value="">Select a service</option>
                                        <option value="General Checkup">General Checkup</option>
                                        <option value="Teeth Cleaning">Teeth Cleaning</option>
                                        <option value="Teeth Whitening">Teeth Whitening</option>
                                        <option value="Root Canal">Root Canal</option>
                                        <option value="Dental Implants">Dental Implants</option>
                                        <option value="Orthodontics">Orthodontics</option>
                                    </select>
                                </div>

                                <div class="field-row">
                                    <div class="field-group">
                                        <label for="field-date">Preferred Date</label>
                                        <div class="field-input-wrap">
                                            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                                            <input type="date" id="field-date" class="field-input has-icon"/>
                                        </div>
                                    </div>

                                    <div class="field-group">
                                        <label for="field-time">Preferred Time</label>
                                        <div class="field-input-wrap">
                                            <svg class="field-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            <select id="field-time" class="field-select has-icon">
                                                <option value="">Select time</option>
                                                <option value="09:00 AM">09:00 AM</option>
                                                <option value="10:00 AM">10:00 AM</option>
                                                <option value="11:00 AM">11:00 AM</option>
                                                <option value="12:00 PM">12:00 PM</option>
                                                <option value="02:00 PM">02:00 PM</option>
                                                <option value="03:00 PM">03:00 PM</option>
                                                <option value="04:00 PM">04:00 PM</option>
                                                <option value="05:00 PM">05:00 PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>"""

html_new = """                                <div class="field-group">
                                    <label>Service Type</label>
                                    <input type="hidden" id="field-service" value="">
                                    <div class="services-grid">
                                        <label class="service-card">
                                            <input type="radio" name="service" value="General Checkup" class="service-radio">
                                            <div class="service-card-inner">General Checkup</div>
                                        </label>
                                        <label class="service-card">
                                            <input type="radio" name="service" value="Teeth Cleaning" class="service-radio">
                                            <div class="service-card-inner">Teeth Cleaning</div>
                                        </label>
                                        <label class="service-card">
                                            <input type="radio" name="service" value="Teeth Whitening" class="service-radio">
                                            <div class="service-card-inner">Teeth Whitening</div>
                                        </label>
                                        <label class="service-card">
                                            <input type="radio" name="service" value="Root Canal" class="service-radio">
                                            <div class="service-card-inner">Root Canal</div>
                                        </label>
                                        <label class="service-card">
                                            <input type="radio" name="service" value="Dental Implants" class="service-radio">
                                            <div class="service-card-inner">Dental Implants</div>
                                        </label>
                                        <label class="service-card">
                                            <input type="radio" name="service" value="Orthodontics" class="service-radio">
                                            <div class="service-card-inner">Orthodontics</div>
                                        </label>
                                    </div>
                                </div>

                                <div class="field-row" style="display: block;">
                                    <div class="field-group">
                                        <label>Preferred Date</label>
                                        <input type="hidden" id="field-date" value="">
                                        <div class="dates-scroll" id="dates-container">
                                            <!-- JS populated -->
                                        </div>
                                    </div>

                                    <div class="field-group" style="margin-top: 24px;">
                                        <label>Preferred Time</label>
                                        <input type="hidden" id="field-time" value="">
                                        <div class="services-grid time-grid">
                                            <label class="service-card">
                                                <input type="radio" name="time" value="09:00 AM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">09:00 AM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="10:00 AM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">10:00 AM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="11:00 AM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">11:00 AM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="12:00 PM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">12:00 PM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="02:00 PM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">02:00 PM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="03:00 PM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">03:00 PM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="04:00 PM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">04:00 PM</div>
                                            </label>
                                            <label class="service-card">
                                                <input type="radio" name="time" value="05:00 PM" class="time-radio">
                                                <div class="service-card-inner time-card-inner">05:00 PM</div>
                                            </label>
                                        </div>
                                    </div>
                                </div>"""

content = content.replace(html_old, html_new)

# Replace JS
js_old = """                document.getElementById('field-service').addEventListener('change', validateStep);
                document.getElementById('field-date').addEventListener('change', validateStep);
                document.getElementById('field-time').addEventListener('change', validateStep);"""

js_new = """                // Generate Date Cards
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
                });

                document.addEventListener('change', (e) => {
                    if (e.target.classList.contains('service-radio')) {
                        document.getElementById('field-service').value = e.target.value;
                        validateStep();
                    }
                    if (e.target.classList.contains('time-radio')) {
                        document.getElementById('field-time').value = e.target.value;
                        validateStep();
                    }
                    if (e.target.classList.contains('date-radio')) {
                        if (e.target.value !== 'custom') {
                            document.getElementById('field-date').value = e.target.value;
                            validateStep();
                        }
                    }
                });"""

content = content.replace(js_old, js_new)

# Also remove renderCalendar and renderTimeSlots if they were added
content = content.replace("renderCalendar();", "// renderCalendar();")
content = content.replace("renderTimeSlots();", "// renderTimeSlots();")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
