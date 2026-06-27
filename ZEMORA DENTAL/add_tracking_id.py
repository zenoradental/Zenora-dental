import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the HTML for the success screen to show Tracking ID and link to Check Status
old_html = """                    <p class="success-thanks" id="success-thanks">Thank you!</p>
                    <p class="success-email-note">We've sent a confirmation email to <strong id="success-email">—</strong></p>
                    <div class="success-summary">"""

new_html = """                    <p class="success-thanks" id="success-thanks">Thank you!</p>
                    <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                        <span style="display: block; font-size: 14px; color: #4338ca; font-weight: 600; margin-bottom: 4px;">Your Tracking ID</span>
                        <strong id="success-tracking-id" style="font-size: 24px; color: #312e81; letter-spacing: 2px;">—</strong>
                    </div>
                    <p class="success-email-note" style="margin-bottom: 10px;">We've sent a confirmation email to <strong id="success-email">—</strong></p>
                    <p style="text-align: center; font-size: 14px; margin-bottom: 20px;"><a href="check-status.html" style="color: #4f46e5; text-decoration: underline; font-weight: 500;">Check Appointment Status here</a></p>
                    <div class="success-summary">"""

content = content.replace(old_html, new_html)

# 2. Update goNext to pass data to showSuccess
old_js1 = """                            showSuccess();
                        }
                    } catch (error) {"""

new_js1 = """                            showSuccess(data);
                        }
                    } catch (error) {"""

content = content.replace(old_js1, new_js1)

# 3. Update showSuccess signature and populate Tracking ID
old_js2 = """            function showSuccess() {
                const name = document.getElementById('field-name').value;"""

new_js2 = """            function showSuccess(data) {
                const name = document.getElementById('field-name').value;
                if (data && data.appointment && data.appointment.appointmentId) {
                    document.getElementById('success-tracking-id').textContent = data.appointment.appointmentId;
                }"""

content = content.replace(old_js2, new_js2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added Tracking ID to success screen and linked check status page")
