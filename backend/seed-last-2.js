
const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Atharv", "Rahul", "Rohan", "Vikram", "Neha", "Priya", "Anjali", "Sneha", "Kavya", "Pooja", "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Deshmukh", "Joshi", "Verma", "Reddy", "Nair", "Iyer", "Rao", "Gupta", "Malhotra", "Kapoor", "Chopra", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const services = ["Consultation", "Root Canal", "Teeth Whitening", "Dental Implants", "Routine Cleaning", "Dental Checkup", "Tooth Extraction", "Braces Adjustment", "Wisdom Tooth Removal", "Crown Fitting"];
const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
const doctors = ["Dr. Michael Chen", "Dr. James Wilson", "Dr. Sheil"];
const symptomsList = [
  "Severe toothache in the lower right jaw.",
  "Bleeding gums when brushing or flossing.",
  "Routine dental checkup and cleaning requested.",
  "Sharp pain when drinking cold liquids.",
  "Wisdom tooth is erupting and causing pain.",
  "Need to get my braces adjusted.",
  "Interested in teeth whitening options.",
  "My old filling fell out yesterday.",
  "Swelling on the left side of my face.",
  "Experiencing jaw pain and clicking sounds.",
  "Need a consultation for dental implants.",
  "Chipped my front tooth in an accident.",
  "Persistent bad breath and gum irritation."
];

async function seedRealistic() {
  const today = new Date();
  const appointments = [];
  
  for (let i = 0; i < 2; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const date = new Date(today);
    
    // Spread dates: 80% in the past 45 days, 20% in the next 15 days
    const daysOffset = Math.random() < 0.8 
        ? -Math.floor(Math.random() * 45) // past
        : Math.floor(Math.random() * 15) + 1; // future
        
    date.setDate(today.getDate() + daysOffset);
    
    // Status logic: if in past, mostly completed/cancelled. if future, pending/confirmed.
    let status;
    if (daysOffset < 0) {
      status = Math.random() < 0.8 ? "Completed" : "Cancelled";
    } else {
      status = Math.random() < 0.5 ? "Pending" : "Confirmed";
    }
    
    // Indian-style phone numbers for realism (+91 98...)
    const phonePrefixes = [98, 97, 99, 94, 88, 77, 89];
    const prefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
    const phone = `+91 ${prefix}${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900) + 100}`;
    
    appointments.push({
      patientName: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 55) + 18,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      phone: phone,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@gmail.com`,
      service: services[Math.floor(Math.random() * services.length)],
      symptoms: symptomsList[Math.floor(Math.random() * symptomsList.length)],
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      appointmentDate: date.toISOString().split('T')[0],
      appointmentTime: `${Math.floor(Math.random() * 8) + 9}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
      status: status
    });
  }
  
  let successCount = 0;
  
  for (let i = 0; i < appointments.length; i++) {
    const apt = appointments[i];
    try {
      const res = await fetch('https://zenora-backend-black.vercel.app/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apt)
      });
      if (res.ok) successCount++;
    } catch (err) {}
    
    await new Promise(r => setTimeout(r, 2000)); // Super safe delay
  }
  console.log(`Success: ${successCount}`);
}

seedRealistic();
