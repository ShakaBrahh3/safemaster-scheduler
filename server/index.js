import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { Pool } = pg;
const app = express();
const port = 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// ── Schema init ──────────────────────────────────────────────────────────────
// Runs schema.sql on every startup so the tables always exist in any
// environment (fresh clone, new Replit fork, CI, etc.).
async function initSchema() {
  const schemaSql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schemaSql);
  console.log('Database schema verified / initialised.');
}

initSchema().catch((err) => {
  console.error('FATAL: could not initialise database schema:', err.message);
  process.exit(1);
});
// ─────────────────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── JOBS ────────────────────────────────────────────────────────────────────

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

// POST create a job
app.post('/api/jobs', async (req, res) => {
  try {
    const job = req.body;
    await pool.query(
      `INSERT INTO jobs (id, site, cost, run, notes, tags, ewp_required, required_ticket, priority, status, day, crew_id, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET
         site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
         required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14`,
      [
        job.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
        job.notes ?? '', JSON.stringify(job.tags ?? []),
        job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
        job.priority ?? 'normal', job.status ?? 'backlog',
        job.day ?? null, job.crewId ?? null,
        job.lat ?? null, job.lng ?? null
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
         required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14
       WHERE id=$1`,
      [
        req.params.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
        job.notes ?? '', JSON.stringify(job.tags ?? []),
        job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
        job.priority ?? 'normal', job.status ?? 'backlog',
        job.day ?? null, job.crewId ?? null,
        job.lat ?? null, job.lng ?? null
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

// Bulk-replace all jobs of a given status (used for optimistic full-sync)
app.post('/api/jobs/bulk', async (req, res) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.json({ ok: true });
    }
    for (const job of jobs) {
      await pool.query(
        `INSERT INTO jobs (id, site, cost, run, notes, tags, ewp_required, required_ticket, priority, status, day, crew_id, lat, lng)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO UPDATE SET
           site=$2, cost=$3, run=$4, notes=$5, tags=$6, ewp_required=$7,
           required_ticket=$8, priority=$9, status=$10, day=$11, crew_id=$12, lat=$13, lng=$14`,
        [
          job.id, job.site, job.cost ?? 0, job.run ?? 'PROGRAMMED',
          job.notes ?? '', JSON.stringify(job.tags ?? []),
          job.ewpRequired ?? false, job.requiredTicket ?? 'WAH',
          job.priority ?? 'normal', job.status ?? 'backlog',
          job.day ?? null, job.crewId ?? null,
          job.lat ?? null, job.lng ?? null
        ]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── CREWS ───────────────────────────────────────────────────────────────────

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
      `INSERT INTO crews (id, name, email, phone, color, tickets, base_location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         name=$2, email=$3, phone=$4, color=$5, tickets=$6, base_location=$7, notes=$8`,
      [
        crew.id, crew.name, crew.email ?? '', crew.phone ?? '',
        crew.color ?? '', JSON.stringify(crew.tickets ?? ['WAH']),
        crew.baseLocation ?? '', crew.notes ?? ''
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
      `UPDATE crews SET name=$2, email=$3, phone=$4, color=$5, tickets=$6, base_location=$7, notes=$8
       WHERE id=$1`,
      [
        req.params.id, crew.name, crew.email ?? '', crew.phone ?? '',
        crew.color ?? '', JSON.stringify(crew.tickets ?? ['WAH']),
        crew.baseLocation ?? '', crew.notes ?? ''
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
        `INSERT INTO crews (id, name, email, phone, color, tickets, base_location, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [
          crew.id, crew.name, crew.email ?? '', crew.phone ?? '',
          crew.color ?? '', JSON.stringify(crew.tickets ?? ['WAH']),
          crew.baseLocation ?? '', crew.notes ?? ''
        ]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`SafeMaster API server running on port ${port}`);
});

// ── HELPERS ─────────────────────────────────────────────────────────────────

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
  };
}
