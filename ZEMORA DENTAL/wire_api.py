import re

file_path = r'd:\WEBSITES\THE ZEHOSP\ZEMORA DENTAL\book-appointment.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_goNext = """            function goNext() {
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    updateUI();
                } else {
                    // Submit — show success
                    showSuccess();
                }
            }"""

new_goNext = """            async function goNext() {
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    updateUI();
                } else {
                    const btnNext = document.getElementById('btn-next');
                    const originalText = btnNext.textContent;
                    btnNext.textContent = 'Submitting...';
                    btnNext.style.opacity = '0.7';
                    btnNext.style.pointerEvents = 'none';

                    const payload = {
                        name: document.getElementById('field-name').value,
                        email: document.getElementById('field-email').value,
                        phone: document.getElementById('field-phone').value,
                        age: document.getElementById('field-age').value,
                        gender: document.getElementById('field-gender').value,
                        service: document.getElementById('field-service').value,
                        date: document.getElementById('field-date').value,
                        time: document.getElementById('field-time').value,
                        notes: document.getElementById('field-notes').value
                    };

                    try {
                        const response = await fetch('http://localhost:3001/api/appointments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            alert(data.error || 'Failed to book appointment. Please try again.');
                            btnNext.textContent = originalText;
                            btnNext.style.opacity = '1';
                            btnNext.style.pointerEvents = 'auto';
                        } else {
                            showSuccess();
                        }
                    } catch (error) {
                        alert('Network Error: Could not connect to the booking server. Please ensure the backend is running.');
                        btnNext.textContent = originalText;
                        btnNext.style.opacity = '1';
                        btnNext.style.pointerEvents = 'auto';
                    }
                }
            }"""

content = content.replace(old_goNext, new_goNext)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Wired up booking form to backend API")
