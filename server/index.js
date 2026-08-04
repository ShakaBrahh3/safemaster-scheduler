import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import xlsx from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { Pool } = pg;
const app = express();
const port = 3001;

function needsSsl(connectionString) {
  if (!connectionString) return false;
  try {
    const { hostname } = new URL(connectionString);
    return !['localhost', '127.0.0.1', 'postgres'].includes(hostname);
  } catch {
    return false;
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSsl(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const VALID_UPLOAD_EXTENSIONS = new Set(['.xlsx', '.xls', '.csv']);
const VALID_REQUIRED_TICKETS = new Set(['WAH', 'EWP', 'ROPE', 'CSE']);
const VALID_PRIORITIES = new Set(['low', 'normal', 'warning', 'high']);

function getFileExtension(fileName = '') {
  const index = fileName.lastIndexOf('.');
  return index >= 0 ? fileName.slice(index).toLowerCase() : '';
}

function getCellValue(row, keys = []) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return null;
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return ['true', 'yes', 'y', '1'].includes(normalized);
  }
  return false;
}

function normalizeTicket(value, fallback = 'WAH') {
  const normalized = String(value || fallback).trim().toUpperCase();
  return VALID_REQUIRED_TICKETS.has(normalized) ? normalized : fallback;
}

function normalizePriority(value, notes = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (VALID_PRIORITIES.has(normalized)) return normalized;

  const noteText = String(notes || '').toLowerCase();
  if (noteText.includes('urgent') || noteText.includes('emergency')) return 'high';
  if (noteText.includes('warning')) return 'warning';
  if (noteText.includes('low')) return 'low';
  return 'normal';
}

function parseTags(value) {
  if (Array.isArray(value)) {
    return value.map(tag => String(tag).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[;,]/)
      .map(tag => tag.trim())
      .filter(Boolean);
  }
  return [];
}

// Schema init
async function initSchema() {
  const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schemaSql);
  console.log('Database schema verified / initialised.');
}

initSchema().catch((err) => {
  console.error('FATAL: could not initialise database schema:', err.message);
  process.exit(1);
});

app.use(cors());
app.use(express.json());

// Helper functions
function dbRowToJob(row) {
  return {
    id: row.id,
    site: row.site,
    cost: parseFloat(row.cost),
    run: row.run,
    notes: row.notes,
    tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
    ewpRequired: row.ewp_required,
    requiredTicket: row.required_ticket,
    priority: row.priority,
    status: row.status,
    day: row.day,
    crewId: row.crew_id,
    lat: row.lat ? parseFloat(row.lat) : null,
    lng: row.lng ? parseFloat(row.lng) : null,
    startTime: row.start_time || '09:00',
    endTime: row.end_time || '17:00',
    duration: row.duration || 480,
    isRecurring: row.is_recurring || false,
    parentJobId: row.parent_job_id,
    recurring: row.recurring ? JSON.parse(row.recurring) : null,
    recurringInstance: row.recurring_instance,
    reminders: row.reminders ? JSON.parse(row.reminders) : []
  };
}

function dbRowToCrew(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    color: row.color,
    tickets: Array.isArray(row.tickets) ? row.tickets : JSON.parse(row.tickets || '["WAH"]'),
    baseLocation: row.base_location,
    notes: row.notes,
    workingHours: row.working_hours ? JSON.parse(row.working_hours) : { start: '08:00', end: '17:00' },
    availability: row.availability ? JSON.parse(row.availability) : {}
  };
}

function dbRowToTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    site: row.site,
    cost: parseFloat(row.cost),
    run: row.run,
    notes: row.notes,
    tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
    ewpRequired: row.ewp_required,
    requiredTicket: row.required_ticket,
    priority: row.priority,
    startTime: row.start_time || '09:00',
    endTime: row.end_time || '17:00',
    duration: row.duration || 480,
    crewId: row.crew_id,
    isDefault: row.is_default || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// JOBS API

// GET all jobs (backlog)
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jobs WHERE status = 'backlog' ORDER BY created_at ASC"
    );
    res.json(result.rows.map(dbRowToJob));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET all scheduled jobs
app.get('/api/schedule', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM jobs WHERE status = 'scheduled' ORDER BY created_at ASC"
    );
    res.json(result.rows.map(dbRowToJob));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET jobs by date range
app.get('/api/jobs/by-date', async (req, res) => {
  try {
    const { startDate, endDate, crewId } = req.query;
    let query = "SELECT * FROM jobs WHERE status = 'scheduled' ";
    const params = [];
    
    if (startDate) {
      params.push(startDate);
      query += `AND day >= $${params.length} `;
    }
    if (endDate) {
      params.push(endDate);
      query += `AND day <= $${params.length} `;
    }
    if (crewId) {
      params.push(crewId);
      query += `AND crew_id = $${params.length} `;
    }
    query += "ORDER BY day, start_time ASC";
    
    const result = await pool.query(query, params);
    res.json(result.rows.map(dbRowToJob));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create a job
app.post('/api/jobs', async (req, res) => {
  try {
    const job = req.body;
    await pool.query(
      `INSERT INTO jobs (id, site, cost, run, notes, tags, ewp_required, required_ticket, priority, status, day, crew_id, lat, lng, start_time, end_time, duration, is_recurring, parent_job_id, recurring, recurring_instance, reminders)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
       ON CONFLICT (id) DO UPDATE SET
         site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
         required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14,
         start_time=$15, end_time=$16, duration=$17, is_recurring=$18, parent_job_id=$19,
         recurring=$20, recurring_instance=$21, reminders=$22`,
      [
        job.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
        job.notes ?? '', JSON.stringify(job.tags ?? []),
        job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
        job.priority ?? 'normal', job.status ?? 'backlog',
        job.day ?? null, job.crewId ?? null,
        job.lat ?? null, job.lng ?? null,
        job.startTime ?? '09:00', job.endTime ?? '17:00', job.duration ?? 480,
        job.isRecurring ?? false, job.parentJobId ?? null,
        JSON.stringify(job.recurring ?? null), job.recurringInstance ?? null,
        JSON.stringify(job.reminders ?? [])
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update a job
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const job = req.body;
    await pool.query(
      `UPDATE jobs SET
         site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
         required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14,
         start_time=$15, end_time=$16, duration=$17, is_recurring=$18, parent_job_id=$19,
         recurring=$20, recurring_instance=$21, reminders=$22
       WHERE id=$1`,
      [
        req.params.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
        job.notes ?? '', JSON.stringify(job.tags ?? []),
        job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
        job.priority ?? 'normal', job.status ?? 'backlog',
        job.day ?? null, job.crewId ?? null,
        job.lat ?? null, job.lng ?? null,
        job.startTime ?? '09:00', job.endTime ?? '17:00', job.duration ?? 480,
        job.isRecurring ?? false, job.parentJobId ?? null,
        JSON.stringify(job.recurring ?? null), job.recurringInstance ?? null,
        JSON.stringify(job.reminders ?? [])
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Bulk-replace all jobs of a given status
app.post('/api/jobs/bulk', async (req, res) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.json({ ok: true });
    }
    for (const job of jobs) {
      await pool.query(
        `INSERT INTO jobs (id, site, cost, run, notes, tags, ewp_required, required_ticket, priority, status, day, crew_id, lat, lng, start_time, end_time, duration, is_recurring, parent_job_id, recurring, recurring_instance, reminders)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
         ON CONFLICT (id) DO UPDATE SET
           site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
           required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14,
           start_time=$15, end_time=$16, duration=$17, is_recurring=$18, parent_job_id=$19,
           recurring=$20, recurring_instance=$21, reminders=$22`,
        [
          job.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
          job.notes ?? '', JSON.stringify(job.tags ?? []),
          job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
          job.priority ?? 'normal', job.status ?? 'backlog',
          job.day ?? null, job.crewId ?? null,
          job.lat ?? null, job.lng ?? null,
          job.startTime ?? '09:00', job.endTime ?? '17:00', job.duration ?? 480,
          job.isRecurring ?? false, job.parentJobId ?? null,
          JSON.stringify(job.recurring ?? null), job.recurringInstance ?? null,
          JSON.stringify(job.reminders ?? [])
        ]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Generate recurring job instances
app.post('/api/jobs/generate-recurring', async (req, res) => {
  try {
    const { parentJobId, startDate, endDate } = req.body;
    
    // Get the parent job
    const parentResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [parentJobId]);
    if (parentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parent job not found' });
    }
    
    const parentJob = dbRowToJob(parentResult.rows[0]);
    if (!parentJob.recurring) {
      return res.status(400).json({ error: 'Job is not recurring' });
    }
    
    // Generate instances (this would be done by a scheduled job in production)
    const instances = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    let instanceNumber = 0;
    
    while (currentDate <= end && instanceNumber < 50) {
      // Check if this date matches the recurring pattern
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const dayOfMonth = currentDate.getDate();
      const month = currentDate.getMonth();
      
      let shouldCreate = false;
      switch (parentJob.recurring.frequency) {
        case 'daily':
          shouldCreate = true;
          break;
        case 'weekly':
          shouldCreate = parentJob.recurring.daysOfWeek?.includes(dayName.toLowerCase());
          break;
        case 'biweekly':
          shouldCreate = parentJob.recurring.daysOfWeek?.includes(dayName.toLowerCase());
          if (shouldCreate) {
            const start = new Date(parentJob.recurring.startDate || startDate);
            const weekDiff = Math.floor((currentDate - start) / (7 * 24 * 60 * 60 * 1000));
            shouldCreate = weekDiff % 2 === 0;
          }
          break;
        case 'monthly':
          shouldCreate = dayOfMonth === parentJob.recurring.dayOfMonth;
          break;
        case 'yearly':
          shouldCreate = month === (parentJob.recurring.month - 1) && dayOfMonth === parentJob.recurring.dayOfMonth;
          break;
      }
      
      if (shouldCreate) {
        const instanceId = `${parentJobId}-instance-${instanceNumber}`;
        instances.push({
          id: instanceId,
          parentJobId: parentJob.id,
          jobData: {
            ...parentJob,
            id: instanceId,
            day: dayName,
            date: currentDate.toISOString().split('T')[0]
          },
          instanceDate: currentDate.toISOString().split('T')[0],
          instanceNumber,
          status: 'scheduled'
        });
        instanceNumber++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Save instances
    for (const instance of instances) {
      await pool.query(
        `INSERT INTO recurring_job_instances (id, parent_job_id, job_data, instance_date, instance_number, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [instance.id, instance.parentJobId, JSON.stringify(instance.jobData), instance.instanceDate, instance.instanceNumber, instance.status]
      );
    }
    
    res.json({ ok: true, generated: instances.length, instances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// CREWS API

app.get('/api/crews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM crews ORDER BY created_at ASC');
    res.json(result.rows.map(dbRowToCrew));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/crews', async (req, res) => {
  try {
    const crew = req.body;
    await pool.query(
      `INSERT INTO crews (id, name, email, phone, color, tickets, base_location, notes, working_hours, availability)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, email=$3, phone=$4, color=$5, tickets=$6, base_location=$7, notes=$8,
         working_hours=$9, availability=$10`,
      [
        crew.id, crew.name, crew.email ?? '', crew.phone ?? '',
        crew.color ?? '', JSON.stringify(crew.tickets ?? ['WAH']),
        crew.baseLocation ?? '', crew.notes ?? '',
        JSON.stringify(crew.workingHours ?? { start: '08:00', end: '17:00' }),
        JSON.stringify(crew.availability ?? {})
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/crews/:id', async (req, res) => {
  try {
    const crew = req.body;
    await pool.query(
      `UPDATE crews SET name=$2, email=$3, phone=$4, color=$5, tickets=$6, base_location=$7, notes=$8,
         working_hours=$9, availability=$10
       WHERE id=$1`,
      [
        req.params.id, crew.name, crew.email ?? '', crew.phone ?? '',
        crew.color ?? '', JSON.stringify(crew.tickets ?? ['WAH']),
        crew.baseLocation ?? '', crew.notes ?? '',
        JSON.stringify(crew.workingHours ?? { start: '08:00', end: '17:00' }),
        JSON.stringify(crew.availability ?? {})
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/crews/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM crews WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/crews/bulk', async (req, res) => {
  try {
    const { crews } = req.body;
    if (!Array.isArray(crews) || crews.length === 0) {
      return res.json({ ok: true });
    }
    for (const crew of crews) {
      await pool.query(
        `INSERT INTO crews (id, name, email, phone, color, tickets, base_location, notes, working_hours, availability)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [
          crew.id, crew.name, crew.email ?? '', crew.phone ?? '',
          crew.color ?? '', JSON.stringify(crew.tickets ?? ['WAH']),
          crew.baseLocation ?? '', crew.notes ?? '',
          JSON.stringify(crew.workingHours ?? { start: '08:00', end: '17:00' }),
          JSON.stringify(crew.availability ?? {})
        ]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Crew Availability API

// GET crew availability
app.get('/api/crews/:id/availability', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM crew_availability WHERE crew_id = $1 ORDER BY date',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// SET crew availability for a date
app.post('/api/crews/:id/availability', async (req, res) => {
  try {
    const { date, status, notes } = req.body;
    const id = `${req.params.id}-${date}`;
    
    await pool.query(
      `INSERT INTO crew_availability (id, crew_id, date, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET status=$4, notes=$5`,
      [id, req.params.id, date, status, notes || '']
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE crew availability for a date
app.delete('/api/crews/:id/availability/:date', async (req, res) => {
  try {
    const id = `${req.params.id}-${req.params.date}`;
    await pool.query('DELETE FROM crew_availability WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Job Templates API

// GET all templates
app.get('/api/templates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_templates ORDER BY created_at ASC');
    res.json(result.rows.map(dbRowToTemplate));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET template by ID
app.get('/api/templates/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_templates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(dbRowToTemplate(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create a template
app.post('/api/templates', async (req, res) => {
  try {
    const template = req.body;
    await pool.query(
      `INSERT INTO job_templates (id, name, site, cost, run, notes, tags, ewp_required, required_ticket, priority, start_time, end_time, duration, crew_id, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, site=$3, cost=$4, run=$5, notes=$6, tags=$7, ewp_required=$8,
         required_ticket=$9, priority=$10, start_time=$11, end_time=$12, duration=$13,
         crew_id=$14, is_default=$15`,
      [
        template.id, template.name, template.site ?? '', template.cost ?? 0, template.run ?? 'PROGRAMMED',
        template.notes ?? '', JSON.stringify(template.tags ?? []),
        template.ewpRequired ?? false, template.requiredTicket ?? 'WAH',
        template.priority ?? 'normal', template.startTime ?? '09:00', template.endTime ?? '17:00',
        template.duration ?? 480, template.crewId ?? null, template.isDefault ?? false
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update a template
app.put('/api/templates/:id', async (req, res) => {
  try {
    const template = req.body;
    await pool.query(
      `UPDATE job_templates SET name=$2, site=$3, cost=$4, run=$5, notes=$6, tags=$7, ewp_required=$8,
         required_ticket=$9, priority=$10, start_time=$11, end_time=$12, duration=$13,
         crew_id=$14, is_default=$15
       WHERE id=$1`,
      [
        req.params.id, template.name, template.site ?? '', template.cost ?? 0, template.run ?? 'PROGRAMMED',
        template.notes ?? '', JSON.stringify(template.tags ?? []),
        template.ewpRequired ?? false, template.requiredTicket ?? 'WAH',
        template.priority ?? 'normal', template.startTime ?? '09:00', template.endTime ?? '17:00',
        template.duration ?? 480, template.crewId ?? null, template.isDefault ?? false
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a template
app.delete('/api/templates/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM job_templates WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Reminders API

// GET reminders for a job
app.get('/api/jobs/:id/reminders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reminders WHERE job_id = $1 ORDER BY minutes_before ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST create a reminder
app.post('/api/reminders', async (req, res) => {
  try {
    const reminder = req.body;
    const id = reminder.id || `${reminder.job_id}-reminder-${Date.now()}`;
    await pool.query(
      `INSERT INTO reminders (id, job_id, crew_id, minutes_before, method, recipient, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET
         job_id=$2, crew_id=$3, minutes_before=$4, method=$5, recipient=$6, message=$7`,
      [id, reminder.job_id, reminder.crew_id, reminder.minutes_before, reminder.method, reminder.recipient, reminder.message]
    );
    res.json({ ok: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a reminder
app.delete('/api/reminders/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reminders WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Export API

// GET iCal export for jobs
app.get('/api/export/ical', async (req, res) => {
  try {
    const { crewId, startDate, endDate } = req.query;
    let query = "SELECT * FROM jobs WHERE status = 'scheduled' ";
    const params = [];
    
    if (crewId) {
      params.push(crewId);
      query += `AND crew_id = $${params.length} `;
    }
    if (startDate) {
      params.push(startDate);
      query += `AND day >= $${params.length} `;
    }
    if (endDate) {
      params.push(endDate);
      query += `AND day <= $${params.length} `;
    }
    query += "ORDER BY day, start_time ASC";
    
    const result = await pool.query(query, params);
    const jobs = result.rows.map(dbRowToJob);
    const crewsResult = await pool.query('SELECT * FROM crews');
    const crews = crewsResult.rows.map(dbRowToCrew);
    
    let icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SafeMaster Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
    
    jobs.forEach(job => {
      const crew = crews.find(c => c.id === job.crewId);
      const date = job.day ? new Date(job.day) : new Date();
      const startTime = job.startTime || '09:00';
      const endTime = job.endTime || '17:00';
      
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      const startDate = new Date(date);
      startDate.setHours(startHours, startMinutes);
      const endDate = new Date(date);
      endDate.setHours(endHours, endMinutes);
      
      const uid = `safemaster-${job.id}-${Date.now()}@safemaster.com.au`;
      const organizer = crew ? `CN=${crew.name}:MAILTO:${crew.email}` : 'CN=SafeMaster Scheduler';
      
      icalContent += `BEGIN:VEVENT
UID:${uid}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace('\.', '')}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${escapeICalText(job.site || 'Job')}
DESCRIPTION:${escapeICalText(job.notes || '')}
LOCATION:${escapeICalText(job.site || '')}
ORGANIZER:${organizer}
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
CLASS:PUBLIC
END:VEVENT
`;
    });
    
    icalContent += 'END:VCALENDAR';
    
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="safemaster-schedule.ics"');
    res.send(icalContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Helper functions for iCal export
function formatICalDate(date) {
  const pad = (num) => num.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeICalText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[,\\n;]/g, (match) => {
      switch (match) {
        case ',': return '\\,';
        case '\\': return '\\\\';
        case ';': return '\\;';
        case '\n': return '\\n';
        default: return match;
      }
    });
}

// HEALTH
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Excel Upload API

// Helper function to parse Excel data and convert to jobs
function parseExcelToJobs(excelData, options = {}) {
  const { sheetIndex = 0, headerRow = 1, status = 'backlog' } = options;
  
  try {
    // Read the Excel data
    const workbook = xlsx.read(excelData, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: headerRow });
    
    const jobs = [];
    
    jsonData.forEach((row, index) => {
      // Map Excel columns to job properties
      const notes = String(getCellValue(row, ['Notes', 'notes', 'Description', 'description']) || '');
      const explicitTicket = getCellValue(row, ['Required Ticket', 'requiredTicket', 'required_ticket', 'Ticket', 'ticket']);
      const explicitPriority = getCellValue(row, ['Priority', 'priority']);
      const explicitEwpRequired = getCellValue(row, ['EWP Required', 'ewpRequired', 'ewp_required']);
      const job = {
        id: getCellValue(row, ['ID', 'id']) || `excel-import-${Date.now()}-${index}`,
        site: getCellValue(row, ['Site', 'site', 'Location', 'location', 'SITE']) || 'Unknown Site',
        cost: parseFloat(getCellValue(row, ['Cost', 'cost', 'Price', 'price']) || 0),
        run: getCellValue(row, ['Run', 'run', 'Type', 'type']) || 'PROGRAMMED',
        notes,
        tags: parseTags(getCellValue(row, ['Tags', 'tags'])),
        ewpRequired: normalizeBoolean(explicitEwpRequired),
        requiredTicket: normalizeTicket(explicitTicket, 'WAH'),
        priority: normalizePriority(explicitPriority, notes),
        status: status,
        day: getCellValue(row, ['Date', 'date', 'Day', 'day']),
        crewId: getCellValue(row, ['Crew', 'crew', 'Crew ID', 'crew id', 'crewId']),
        lat: getCellValue(row, ['Latitude', 'latitude', 'Lat', 'lat']),
        lng: getCellValue(row, ['Longitude', 'longitude', 'Lng', 'lng']),
        startTime: getCellValue(row, ['Start Time', 'startTime', 'Start', 'start']) || '09:00',
        endTime: getCellValue(row, ['End Time', 'endTime', 'End', 'end']) || '17:00',
        duration: parseInt(getCellValue(row, ['Duration', 'duration']) || 480, 10),
        isRecurring: false,
        parentJobId: null,
        recurring: null,
        recurringInstance: null,
        reminders: []
      };
      
      // Auto-detect ticket requirements from notes
      if (job.notes.toLowerCase().includes('rope') || job.notes.toLowerCase().includes('descent')) {
        job.requiredTicket = 'ROPE';
        if (!job.tags.includes('ROPE')) job.tags.push('ROPE');
      } else if (job.notes.toLowerCase().includes('ewp') || job.notes.toLowerCase().includes('elevating')) {
        job.requiredTicket = 'EWP';
        job.ewpRequired = true;
        if (!job.tags.includes('EWP')) job.tags.push('EWP');
      } else if (job.notes.toLowerCase().includes('confined') || job.notes.toLowerCase().includes('pit')) {
        job.requiredTicket = 'CSE';
        if (!job.tags.includes('CSE')) job.tags.push('CSE');
      }

      if (job.requiredTicket === 'EWP') {
        job.ewpRequired = true;
      }
      
      // Ensure cost is a valid number
      job.cost = isNaN(job.cost) ? 0 : job.cost;
      
      // Ensure duration is a valid number
      job.duration = isNaN(job.duration) ? 480 : job.duration;
      job.lat = job.lat === null || job.lat === '' || isNaN(parseFloat(job.lat)) ? null : parseFloat(job.lat);
      job.lng = job.lng === null || job.lng === '' || isNaN(parseFloat(job.lng)) ? null : parseFloat(job.lng);
      
      jobs.push(job);
    });
    
    return jobs;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

// POST upload Excel file and import jobs
app.post('/api/upload/excel', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'No file uploaded. Please include a file with the field name "file".' 
      });
    }
    
    // Check if the file is an Excel file
    const fileExtension = getFileExtension(req.file.originalname);
    
    if (!VALID_UPLOAD_EXTENSIONS.has(fileExtension)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid file type. Only .xlsx, .xls, and .csv files are supported.' 
      });
    }
    
    // Parse the Excel file
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const jobs = parseExcelToJobs(req.file.buffer, options);
    
    // Save jobs to database
    const results = {
      total: jobs.length,
      created: 0,
      updated: 0,
      skipped: 0,
      jobs: []
    };
    
    for (const job of jobs) {
      try {
        // Check if job already exists
        const existingJob = await pool.query('SELECT id FROM jobs WHERE id = $1', [job.id]);
        
        if (existingJob.rows.length > 0) {
          // Update existing job
          await pool.query(
            `UPDATE jobs SET
              site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
              required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14,
              start_time=$15, end_time=$16, duration=$17, is_recurring=$18, parent_job_id=$19,
              recurring=$20, recurring_instance=$21, reminders=$22
            WHERE id=$1`,
            [
              job.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
              job.notes ?? '', JSON.stringify(job.tags ?? []),
              job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
              job.priority ?? 'normal', job.status ?? 'backlog',
              job.day ?? null, job.crewId ?? null,
              job.lat ?? null, job.lng ?? null,
              job.startTime ?? '09:00', job.endTime ?? '17:00', job.duration ?? 480,
              job.isRecurring ?? false, job.parentJobId ?? null,
              JSON.stringify(job.recurring ?? null), job.recurringInstance ?? null,
              JSON.stringify(job.reminders ?? [])
            ]
          );
          results.updated++;
        } else {
          // Create new job
          await pool.query(
            `INSERT INTO jobs (id, site, cost, run, notes, tags, ewp_required, required_ticket, priority, status, day, crew_id, lat, lng, start_time, end_time, duration, is_recurring, parent_job_id, recurring, recurring_instance, reminders)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
             ON CONFLICT (id) DO UPDATE SET
               site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
               required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14,
               start_time=$15, end_time=$16, duration=$17, is_recurring=$18, parent_job_id=$19,
               recurring=$20, recurring_instance=$21, reminders=$22`,
            [
              job.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
              job.notes ?? '', JSON.stringify(job.tags ?? []),
              job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
              job.priority ?? 'normal', job.status ?? 'backlog',
              job.day ?? null, job.crewId ?? null,
              job.lat ?? null, job.lng ?? null,
              job.startTime ?? '09:00', job.endTime ?? '17:00', job.duration ?? 480,
              job.isRecurring ?? false, job.parentJobId ?? null,
              JSON.stringify(job.recurring ?? null), job.recurringInstance ?? null,
              JSON.stringify(job.reminders ?? [])
            ]
          );
          results.created++;
        }
        
        results.jobs.push(job);
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        results.skipped++;
      }
    }
    
    res.json({ 
      ok: true, 
      message: `Successfully imported Excel file. ${results.created} jobs created, ${results.updated} jobs updated, ${results.skipped} jobs skipped.`,
      results 
    });
    
  } catch (err) {
    console.error('Error uploading Excel file:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to upload and process Excel file.' 
    });
  }
});

// GET Excel template for download (sample format)
app.get('/api/upload/excel-template', async (req, res) => {
  try {
    // Create a sample Excel template
    const sampleData = [
      {
        ID: '',
        Site: 'Your Site Name',
        Cost: 500,
        Run: 'PROGRAMMED',
        Notes: 'Routine maintenance work',
        'Required Ticket': 'WAH',
        Priority: 'normal',
        Date: '2024-01-01',
        'Crew ID': '',
        Latitude: -33.8688,
        Longitude: 151.2093,
        'Start Time': '09:00',
        'End Time': '17:00',
        Duration: 480
      },
      {
        ID: '',
        Site: 'Another Site',
        Cost: 750,
        Run: 'REACTIVE',
        Notes: 'Urgent repair work with EWP access',
        'Required Ticket': 'EWP',
        Priority: 'high',
        Date: '2024-01-02',
        'Crew ID': '',
        Latitude: -33.8650,
        Longitude: 151.2100,
        'Start Time': '08:00',
        'End Time': '16:00',
        Duration: 480
      }
    ];
    
    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Jobs Template');
    
    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="safemaster-jobs-template.xlsx"');
    res.send(excelBuffer);
    
  } catch (err) {
    console.error('Error generating Excel template:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to generate Excel template.' 
    });
  }
});

// POST validate Excel file without importing (preview)
app.post('/api/upload/excel-preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'No file uploaded.' 
      });
    }
    
    const fileExtension = getFileExtension(req.file.originalname);
    
    if (!VALID_UPLOAD_EXTENSIONS.has(fileExtension)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid file type. Only .xlsx, .xls, and .csv files are supported.' 
      });
    }
    
    // Parse the Excel file
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    const jobs = parseExcelToJobs(req.file.buffer, { ...options, status: 'preview' });
    
    res.json({ 
      ok: true, 
      message: `Preview: ${jobs.length} jobs would be imported`,
      jobs 
    });
    
  } catch (err) {
    console.error('Error previewing Excel file:', err);
    res.status(500).json({ 
      ok: false, 
      error: err.message || 'Failed to preview Excel file.' 
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SafeMaster API server running on port ${port}`);
});
