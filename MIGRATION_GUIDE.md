# SafeMaster Scheduler - Migration Guide

## 📋 Complete Migration Guide for v5.0

This guide covers migrating from v4.x to v5.0 with all the new features.

---

## 🎯 OVERVIEW

**Version 5.0** introduces major new features:
- ✅ Recurring Jobs
- ✅ Time Slot Scheduling
- ✅ Crew Availability Calendar
- ✅ Reminder System
- ✅ Job Templates
- ✅ Enhanced Export Options

**Migration Complexity**: 🟢 **Low** - Most changes are additive

---

## 📊 MIGRATION PATHS

### Path 1: Fresh Installation (Recommended for New Users)
1. Clone the repository
2. Run `docker compose up --build`
3. Access at `http://localhost:8080`
4. All features work immediately

### Path 2: Existing Installation (For Current Users)
1. **Backup your data** (see below)
2. **Update the database schema** (automatic on restart)
3. **Update your frontend code** (if customized)
4. **Test thoroughly**

---

## 🔧 STEP 1: BACKUP YOUR DATA

### Option A: Database Dump (Recommended)
```bash
# Connect to your PostgreSQL database and run:
pg_dump -U safemaster -d safemaster -F c -f safemaster_backup_$(date +%Y%m%d).dump

# Or using docker:
docker exec safemaster_db pg_dump -U safemaster -d safemaster > safemaster_backup.sql
```

### Option B: Export via API
```bash
# Export all data as JSON
curl http://localhost:3001/api/jobs > jobs_backup.json
curl http://localhost:3001/api/schedule > schedule_backup.json
curl http://localhost:3001/api/crews > crews_backup.json
```

### Option C: Docker Volume Backup
```bash
# Find your volume name
docker volume ls

# Backup the volume
docker run --rm -v safemaster_pgdata:/volume -v $(pwd):/backup alpine tar cvf /backup/safemaster_pgdata.tar /volume
```

---

## 🗄️ STEP 2: DATABASE MIGRATION

### Automatic Migration (Recommended)
The schema is automatically updated on server startup. Simply:

1. **Stop your current services**
   ```bash
   docker compose down
   ```

2. **Update the code**
   ```bash
   git pull origin main
   # Or if on the feature branch:
   git pull origin vibe/optimizations-18db61
   ```

3. **Restart the services**
   ```bash
   docker compose up --build
   ```

The server will automatically run `schema.sql` on startup, which:
- Creates new tables if they don't exist
- Adds new columns to existing tables
- Creates all necessary indexes
- Sets up triggers for automatic timestamps

### Manual Migration (If Needed)

If you need to run the migration manually:

```bash
# Connect to your database
psql -U safemaster -d safemaster

# Run the schema updates
\i server/schema.sql
```

### New Tables Created

1. **job_templates** - Stores reusable job templates
2. **recurring_job_instances** - Stores generated instances of recurring jobs
3. **reminders** - Stores reminder configurations
4. **crew_availability** - Stores crew availability by date

### New Columns Added

**jobs table:**
- `start_time` - Job start time (default: '09:00')
- `end_time` - Job end time (default: '17:00')
- `duration` - Duration in minutes (default: 480)
- `is_recurring` - Boolean flag for recurring jobs
- `parent_job_id` - Reference to parent recurring job
- `recurring` - JSONB field with recurring pattern
- `recurring_instance` - Instance number for recurring jobs
- `reminders` - JSONB array of reminder configurations

**crews table:**
- `working_hours` - JSONB with start and end times
- `availability` - JSONB with availability by date

---

## 🔄 STEP 3: FRONTEND MIGRATION

### For Most Users: No Action Required

The frontend has been updated to work with both old and new data formats. If you haven't customized `App.jsx`, you can simply:

1. Pull the latest code
2. Restart your services
3. Everything should work

### For Customized Installations

If you've customized `App.jsx` or other frontend files, you'll need to:

1. **Review the changes** in the new `App.jsx`
2. **Merge your customizations** with the new code
3. **Test thoroughly**

#### Key Changes to Be Aware Of:

1. **New State Variables**
   - `showRecurringModal` - Controls recurring job modal
   - `showTimeSlotModal` - Controls time slot selector
   - `showAvailabilityCalendar` - Controls availability calendar
   - `showReminderModal` - Controls reminder settings
   - `showTemplateModal` - Controls job template modal
   - `showExportModal` - Controls export modal
   - `selectedDate` - Selected date for time slots
   - `selectedCrewForTime` - Selected crew for time slots
   - `jobTemplates` - Array of job templates

2. **New Job Fields**
   - `startTime` - Default: '09:00'
   - `endTime` - Default: '17:00'
   - `duration` - Default: 480 (minutes)

3. **New Crew Fields**
   - `workingHours` - Default: { start: '08:00', end: '17:00' }
   - `availability` - Default: {}

4. **New Imports**
   ```javascript
   // New components
   import { RecurringJobModal } from './components/RecurringJobModal';
   import { TimeSlotSelector } from './components/TimeSlotSelector';
   import { AvailabilityCalendar } from './components/AvailabilityCalendar';
   import { ReminderSettings } from './components/ReminderSettings';
   import { JobTemplateModal } from './components/JobTemplateModal';
   import { ExportModal } from './components/ExportModal';
   
   // New constants
   import { RECURRING_FREQUENCY, AVAILABILITY_STATUS } from './constants';
   
   // New utilities
   import { 
     generateRecurringJobs,
     formatRecurringDescription,
     isRecurringJob,
     getParentJobId,
     generateICalContent,
     checkConflict,
     generateJobId,
     formatTime,
     timeToMinutes,
     minutesToTime,
     calculateDuration,
     formatDuration,
     getAvailableTimeSlots
   } from './utils';
   ```

5. **New API Calls**
   - All existing API calls remain the same
   - New endpoints are available for new features
   - See `server/index.js` for all new endpoints

---

## 🧪 STEP 4: TESTING THE MIGRATION

### Test Checklist

#### Database Tests
- [ ] Run the application and check for errors
- [ ] Verify existing jobs are still visible
- [ ] Verify existing crews are still visible
- [ ] Check that new fields have default values

#### New Feature Tests
- [ ] **Recurring Jobs**: Create a recurring job and verify it saves
- [ ] **Time Slots**: Open time slot selector and verify it works
- [ ] **Availability Calendar**: Open calendar and verify it displays
- [ ] **Reminders**: Add a reminder to a job and verify it saves
- [ ] **Templates**: Create a template and verify it saves
- [ ] **Export**: Export to CSV, iCal, JSON and verify files are created

#### Backward Compatibility Tests
- [ ] Verify existing jobs without new fields still work
- [ ] Verify existing crews without new fields still work
- [ ] Verify drag and drop scheduling still works
- [ ] Verify AI optimization still works
- [ ] Verify all existing filters still work

---

## 📝 STEP 5: DATA MIGRATION (IF NEEDED)

### Migrating Existing Jobs

If you want to add the new fields to existing jobs, you can run:

```sql
-- Add default values to existing jobs
UPDATE jobs 
SET 
  start_time = '09:00',
  end_time = '17:00',
  duration = 480,
  is_recurring = false
WHERE start_time IS NULL OR end_time IS NULL;
```

### Migrating Existing Crews

```sql
-- Add default values to existing crews
UPDATE crews 
SET 
  working_hours = '{"start": "08:00", "end": "17:00"}',
  availability = '{}'
WHERE working_hours IS NULL OR availability IS NULL;
```

---

## 🚀 STEP 6: DEPLOYMENT

### Docker Deployment (Recommended)

```bash
# Stop current services
docker compose down

# Pull latest code
git pull origin main

# Rebuild and start
docker compose up --build -d

# Check logs
docker compose logs -f
```

### Manual Deployment

```bash
# Stop current services
pm2 stop all

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Start services
pm2 start server/index.js --name safemaster-api
npm run build
pm2 start npm --name safemaster-frontend -- start
```

---

## 🔄 ROLLBACK PLAN

If you need to rollback to v4.x:

### Option A: Database Rollback
```bash
# Restore from backup
pg_restore -U safemaster -d safemaster -c safemaster_backup_$(date +%Y%m%d).dump
```

### Option B: Code Rollback
```bash
# Checkout previous version
git checkout v4.x

# Rebuild and restart
docker compose down
docker compose up --build
```

---

## 📊 MIGRATION TIMELINE

| Task | Estimated Time | Complexity |
|------|---------------|------------|
| Backup Data | 5-10 minutes | Low |
| Update Code | 2-5 minutes | Low |
| Database Migration | Automatic | Low |
| Frontend Migration | 0-30 minutes | Low-Medium |
| Testing | 15-30 minutes | Medium |
| Deployment | 5-10 minutes | Low |
| **Total** | **30-90 minutes** | **Low** |

---

## 💡 TROUBLESHOOTING

### Common Issues and Solutions

#### Issue 1: Database connection errors
**Symptom**: Server fails to start with database connection errors

**Solution**:
```bash
# Check if database is running
docker ps

# If not, start it
docker compose up -d postgres

# Wait a few seconds and restart the API
docker compose restart api
```

#### Issue 2: Missing columns in database
**Symptom**: Errors about missing columns (start_time, end_time, etc.)

**Solution**:
```bash
# The schema should auto-update, but you can force it:
docker compose down
docker compose up --build
```

#### Issue 3: Frontend build errors
**Symptom**: `npm run build` fails with errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Issue 4: New features not working
**Symptom**: New features (recurring jobs, etc.) don't work

**Solution**:
1. Check browser console for errors (F12)
2. Verify the backend API is running
3. Check that the new database columns exist
4. Ensure you've pulled the latest code

#### Issue 5: Data not displaying
**Symptom**: Existing jobs/crews not showing up

**Solution**:
```bash
# Check the API directly
curl http://localhost:3001/api/jobs
curl http://localhost:3001/api/crews

# If empty, check database
psql -U safemaster -d safemaster -c "SELECT * FROM jobs;"
```

---

## 📞 SUPPORT

If you encounter any issues during migration:

1. **Check this guide** for common issues
2. **Review the logs** for error messages
3. **Check the GitHub PR** for any updates: https://github.com/ShakaBrahh3/safemaster-scheduler/pull/6
4. **Create an issue** on GitHub with details of the problem

---

## ✅ MIGRATION CHECKLIST

- [ ] Backup database and code
- [ ] Pull latest code from repository
- [ ] Stop current services
- [ ] Update code
- [ ] Restart services (database migrates automatically)
- [ ] Verify existing data is intact
- [ ] Test new features
- [ ] Test backward compatibility
- [ ] Deploy to production
- [ ] Monitor for issues

---

## 🎉 POST-MIGRATION

Once migration is complete:

1. **Update your documentation** to reflect new features
2. **Train your team** on the new features
3. **Monitor performance** and report any issues
4. **Provide feedback** on the migration process

---

## 📚 ADDITIONAL RESOURCES

- **NEW_FEATURES.md** - Detailed documentation of all new features
- **OPTIMIZATIONS_IMPLEMENTED.md** - List of all optimizations
- **IMPLEMENTATION_SUMMARY.md** - Complete implementation summary
- **GitHub PR #6** - https://github.com/ShakaBrahh3/safemaster-scheduler/pull/6

---

**Last Updated**: 2026-07-08
**Version**: SafeMaster Scheduler v5.0
**Migration Guide Version**: 1.0
