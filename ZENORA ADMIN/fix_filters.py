import os

filepath = r"d:\WEBSITES\THE ZEHOSP\ZENORA ADMIN\src\App.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_filter_logic = """      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = apt.appointmentDate === new Date().toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        matchesDate = apt.appointmentDate >= today.toISOString().split('T')[0] && 
                     apt.appointmentDate <= weekFromNow.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const today = new Date();
        const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        matchesDate = apt.appointmentDate >= today.toISOString().split('T')[0] && 
                     apt.appointmentDate <= monthFromNow.toISOString().split('T')[0];
      }"""

new_filter_logic = """      let matchesDate = true;
      const today = new Date();
      // Adjust timezone to get correct local date string
      const localTodayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
      
      if (dateFilter === 'today') {
        matchesDate = apt.appointmentDate === localTodayStr;
      } else if (dateFilter === 'week') {
        const currentDay = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - currentDay);
        const startStr = new Date(startOfWeek.getTime() - startOfWeek.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const endStr = new Date(endOfWeek.getTime() - endOfWeek.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        matchesDate = apt.appointmentDate >= startStr && apt.appointmentDate <= endStr;
      } else if (dateFilter === 'month') {
        const currentMonthStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 7); // YYYY-MM
        matchesDate = apt.appointmentDate.startsWith(currentMonthStr);
      }"""

if old_filter_logic in content:
    content = content.replace(old_filter_logic, new_filter_logic)
    print("Replaced date filter logic")
else:
    print("Could not find old date filter logic")

# Add items prop to Status Select
status_select = "<Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>"
status_select_new = """<Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')} items={[
                { value: 'all', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Confirmed', label: 'Confirmed' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Cancelled', label: 'Cancelled' }
              ]}>"""
if status_select in content:
    content = content.replace(status_select, status_select_new)
    print("Replaced status select")

# Add items prop to Date Select
date_select = "<Select value={dateFilter} onValueChange={(val) => setDateFilter(val || 'all')}>"
date_select_new = """<Select value={dateFilter} onValueChange={(val) => setDateFilter(val || 'all')} items={[
                { value: 'all', label: 'All Dates' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' }
              ]}>"""
if date_select in content:
    content = content.replace(date_select, date_select_new)
    print("Replaced date select")

# Add items prop to Sort Select
sort_select = "<Select value={sortBy} onValueChange={(val) => setSortBy(val || 'newest')}>"
sort_select_new = """<Select value={sortBy} onValueChange={(val) => setSortBy(val || 'newest')} items={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'name', label: 'Name (A-Z)' }
              ]}>"""
if sort_select in content:
    content = content.replace(sort_select, sort_select_new)
    print("Replaced sort select")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Saved App.tsx")
