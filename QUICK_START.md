# Quick Reference: New Features

## 🧑‍💼 Crew Management

### Add a New Inspector
1. Click **"Crews & Tickets"** tab (left sidebar)
2. Click **"Add Inspector"** button (green)
3. Fill in:
   - Inspector Name
   - Email address
   - Phone (optional)
   - Base Location (e.g. "Perth Metro")
   - Notes/Specialization
   - Select safety tickets (WAH, EWP, ROPE, CSE)
4. Click **"Add Inspector"**
5. New crew appears in the list with a unique color

### Edit Existing Inspector
1. In Crews tab, find the crew card
2. Click the **edit icon** (pencil) on the right
3. Modify any details
4. Click **"Save Changes"**

### Delete Inspector
1. In Crews tab, find the crew card
2. Click the **delete icon** (trash) on the right
3. Confirm when prompted
4. All their scheduled jobs are unassigned to backlog

### Manage Certifications
- In any crew card, click the 4 ticket buttons to toggle
- ✓ = Has certification | + = Can be added
- Changes apply immediately for validation

---

## 🤖 AI Route Optimization

### How It Works
- **Analyzes** all unscheduled jobs in backlog
- **Sorts by** priority (High → Warning → Normal) + cost
- **Matches** jobs to qualified crews (crew must have required ticket)
- **Balances** workload across crew/day combinations
- **Proposes** optimized weekly schedule

### Run Optimization
1. Click **"Crews & Tickets"** tab (left sidebar)
2. Ensure backlog has unscheduled jobs
3. Click **"AI Auto-Route"** button (teal)
4. Review proposed assignments in modal
5. Each row shows: Site → Crew + Day → Ticket Required
6. Two options:
   - **"Discard"** - Reject and go back
   - **"Apply Optimized Schedule"** - Commit to calendar

### What Gets Scheduled
✓ All backlog jobs with qualified crews  
✓ Respects ticket requirements  
✓ Spreads workload evenly  
✗ Unqualified jobs stay in backlog (no matching crew)

### Example
**Backlog:** 5 jobs needing WAH, 2 needing EWP, 1 needing CSE  
**Crews:** Tony (WAH+EWP), Beau (WAH), Tyron (WAH+EWP+ROPE), Andrew (WAH+CSE)

**Result:**
- Mon Tony: Job1 (EWP)
- Mon Beau: Job2 (WAH)
- Tue Tyron: Job3 (WAH)
- Wed Tony: Job4 (EWP)
- Thu Andrew: Job5 (CSE)

---

## 📍 Location Data

### What's New
- Every job now has coordinates (latitude, longitude)
- Sample Western Australia locations included
- Enables future map display and distance calculations

### Add Location to New Jobs
*Current: Manual entry when API added*  
*Future: Click map or enter address to auto-fill*

### View Job Location
*Coming Soon:* Click job card to see satellite view  
*Ready:* All data is there; just needs UI component

---

## 🔄 Common Workflows

### Scenario 1: New Crew, Start Scheduling
1. Click "Add Inspector" → Create "Sarah" with WAH+EWP
2. Click "AI Auto-Route" → System assigns matching jobs
3. Review preview → Click "Apply"
4. Sarah's jobs appear in calendar grid

### Scenario 2: Crew Unavailable, Reassign Jobs
1. Go to Crews tab
2. Find crew's card → Click delete (or uncheck all tickets to disable)
3. Jobs return to backlog
4. Run "AI Auto-Route" again
5. System redistributes to remaining qualified crews

### Scenario 3: Add Jobs, Optimize Incrementally
1. Import jobs via "Excel Importer" (header)
2. Backlog now shows new jobs
3. Click "AI Auto-Route"
4. Review and apply
5. Repeat as new jobs arrive throughout week

### Scenario 4: Manual + AI Hybrid
1. Manually drag some high-priority jobs to specific crews
2. Leave others in backlog
3. Click "AI Auto-Route"
4. AI fills gaps, respects manually-scheduled jobs
5. All jobs distributed optimally

---

## 💡 Tips & Tricks

### Crew Colors
- Each crew gets unique color (emerald, sky, violet, amber, rose, cyan)
- Colors persist even if you edit crew details
- Helps visually distinguish crews in schedule grid

### Workload Balancing
- AI prefers crew/days with less assigned cost
- Spreads $1000-$3000 jobs to balance workload
- Respects ticket requirements absolutely (won't assign WAH-only crew to EWP job)

### High Priority Jobs
- Sorted first in optimization
- Get scheduled to earliest available crew/day
- Ensures critical jobs don't get delayed

### Ticket Filtering
- Toggle crew tickets to simulate availability
- Re-run optimization to see impact
- Useful for "what-if" scenarios

---

## ⚠️ Important Notes

- **No API Calls**: Route optimization runs locally (fast, free, private)
- **Automatic Validation**: Can't schedule jobs without matching crew tickets
- **Backlog Intact**: Only optimized jobs move to schedule; others stay in backlog
- **Reversible**: Drag jobs back to backlog anytime to unassign

---

## 📊 Data Formats

### Crew Object
```javascript
{
  id: "crew-12345",
  name: "Sarah Johnson",
  email: "sarah@company.com",
  phone: "0412 555 1234",
  color: "border-emerald-500 bg-emerald-50/40 text-emerald-950",
  tickets: ["WAH", "EWP"],
  baseLocation: "Perth Metro",
  notes: "EWP specialist, 5 years experience"
}
```

### Job with Location
```javascript
{
  id: "job-123",
  site: "Puma Collie",
  cost: 1250.00,
  run: "SOUTHWEST RUN",
  lat: -33.6550,
  lng: 115.3319,
  requiredTicket: "WAH",
  status: "backlog"
  // ... other fields
}
```

---

## 🛠️ Troubleshooting

**Problem**: "No qualified crew found" after AI optimization  
**Solution**: Check crew tickets match job requirements. Add missing ticket to crew → re-run.

**Problem**: Crew not appearing in list  
**Solution**: Refresh page or ensure form was submitted. Check console for errors.

**Problem**: Jobs keep going to same crew  
**Solution**: This is load-balanced, but if same crew is only qualified, that's expected. Add tickets to other crews.

**Problem**: Can't add inspector - "Please fill in name and email"  
**Solution**: Both Name and Email fields are required. Leave other fields empty if not needed.

---

## 📱 Keyboard Shortcuts
*None implemented yet - all features use mouse/touch clicks*

## ⌨️ Navigation
- **Left Sidebar**: "Crews & Tickets" tab at top
- **Add Inspector**: Green button in Crews tab
- **AI Auto-Route**: Teal button in Crews tab (right of Add button)
- **Crew Actions**: Edit (pencil) and Delete (trash) icons on each card
- **Crew Tickets**: Click any 4 ticket buttons to toggle on/off

---

**Last Updated**: 2026-07-08  
**Version**: SafeMaster v4.5
