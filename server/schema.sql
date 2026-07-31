-- SafeMaster Scheduler — database schema
-- This file is executed automatically on server startup (server/index.js).
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE).

CREATE TABLE IF NOT EXISTS jobs (
  id              TEXT        PRIMARY KEY,
  site            TEXT        NOT NULL,
  cost            NUMERIC(10,2) NOT NULL DEFAULT 0,
  run             TEXT        NOT NULL DEFAULT 'PROGRAMMED',
  notes           TEXT        NOT NULL DEFAULT '',
  tags            JSONB       NOT NULL DEFAULT '[]',
  ewp_required    BOOLEAN     NOT NULL DEFAULT FALSE,
  required_ticket TEXT        NOT NULL DEFAULT 'WAH',
  priority        TEXT        NOT NULL DEFAULT 'normal',
  status          TEXT        NOT NULL DEFAULT 'backlog'
                              CHECK (status IN ('backlog', 'scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'on_hold')),
  day             TEXT,
  crew_id         TEXT,
  lat             NUMERIC(10, 6),
  lng             NUMERIC(10, 6),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- New fields for scheduling features
  start_time      TEXT        DEFAULT '09:00',
  end_time        TEXT        DEFAULT '17:00',
  duration        INTEGER     DEFAULT 480, -- in minutes
  
  -- Recurring job fields
  is_recurring    BOOLEAN     NOT NULL DEFAULT FALSE,
  parent_job_id   TEXT,
  recurring       JSONB       DEFAULT NULL,
  recurring_instance INTEGER DEFAULT NULL,
  
  -- Reminder fields
  reminders       JSONB       DEFAULT '[]'
);

-- Optimized indexes for query performance
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_crew_id_idx ON jobs (crew_id);
CREATE INDEX IF NOT EXISTS jobs_day_idx ON jobs (day);
CREATE INDEX IF NOT EXISTS jobs_priority_idx ON jobs (priority);
CREATE INDEX IF NOT EXISTS jobs_required_ticket_idx ON jobs (required_ticket);
CREATE INDEX IF NOT EXISTS jobs_status_crew_day_idx ON jobs (status, crew_id, day);
CREATE INDEX IF NOT EXISTS jobs_status_priority_idx ON jobs (status, priority);
CREATE INDEX IF NOT EXISTS jobs_crew_day_idx ON jobs (crew_id, day);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_is_recurring_idx ON jobs (is_recurring);
CREATE INDEX IF NOT EXISTS jobs_parent_job_id_idx ON jobs (parent_job_id);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS jobs_crew_status_idx ON jobs (crew_id, status);

CREATE TABLE IF NOT EXISTS crews (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL DEFAULT '',
  phone         TEXT        NOT NULL DEFAULT '',
  color         TEXT        NOT NULL DEFAULT '',
  tickets       JSONB       NOT NULL DEFAULT '["WAH"]',
  base_location TEXT        NOT NULL DEFAULT '',
  notes         TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- New fields for scheduling features
  working_hours JSONB       DEFAULT '{"start": "08:00", "end": "17:00"}',
  availability  JSONB       DEFAULT '{}'
);

-- Optimized indexes for crew queries
CREATE INDEX IF NOT EXISTS crews_name_idx ON crews (name);
CREATE INDEX IF NOT EXISTS crews_tickets_idx ON crews USING GIN (tickets);
CREATE INDEX IF NOT EXISTS crews_base_location_idx ON crews (base_location);
CREATE INDEX IF NOT EXISTS crews_created_at_idx ON crews (created_at DESC);

-- Job Templates Table
CREATE TABLE IF NOT EXISTS job_templates (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  site            TEXT        NOT NULL DEFAULT '',
  cost            NUMERIC(10,2) NOT NULL DEFAULT 0,
  run             TEXT        NOT NULL DEFAULT 'PROGRAMMED',
  notes           TEXT        NOT NULL DEFAULT '',
  tags            JSONB       NOT NULL DEFAULT '[]',
  ewp_required    BOOLEAN     NOT NULL DEFAULT FALSE,
  required_ticket TEXT        NOT NULL DEFAULT 'WAH',
  priority        TEXT        NOT NULL DEFAULT 'normal',
  start_time      TEXT        DEFAULT '09:00',
  end_time        TEXT        DEFAULT '17:00',
  duration        INTEGER     DEFAULT 480,
  crew_id         TEXT,
  is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for job templates
CREATE INDEX IF NOT EXISTS job_templates_name_idx ON job_templates (name);
CREATE INDEX IF NOT EXISTS job_templates_is_default_idx ON job_templates (is_default);
CREATE INDEX IF NOT EXISTS job_templates_crew_id_idx ON job_templates (crew_id);
CREATE INDEX IF NOT EXISTS job_templates_created_at_idx ON job_templates (created_at DESC);

-- Recurring Job Instances Table (for generated instances)
CREATE TABLE IF NOT EXISTS recurring_job_instances (
  id              TEXT        PRIMARY KEY,
  parent_job_id   TEXT        NOT NULL,
  job_data        JSONB       NOT NULL,
  instance_date   DATE        NOT NULL,
  instance_number INTEGER     NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'scheduled',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for recurring job instances
CREATE INDEX IF NOT EXISTS recurring_job_instances_parent_idx ON recurring_job_instances (parent_job_id);
CREATE INDEX IF NOT EXISTS recurring_job_instances_date_idx ON recurring_job_instances (instance_date);
CREATE INDEX IF NOT EXISTS recurring_job_instances_status_idx ON recurring_job_instances (status);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id              TEXT        PRIMARY KEY,
  job_id          TEXT        NOT NULL,
  crew_id         TEXT,
  minutes_before  INTEGER     NOT NULL,
  method          TEXT        NOT NULL DEFAULT 'email',
  recipient       TEXT        NOT NULL DEFAULT 'crew',
  message         TEXT        NOT NULL DEFAULT '',
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reminders
CREATE INDEX IF NOT EXISTS reminders_job_id_idx ON reminders (job_id);
CREATE INDEX IF NOT EXISTS reminders_crew_id_idx ON reminders (crew_id);
CREATE INDEX IF NOT EXISTS reminders_sent_at_idx ON reminders (sent_at);
CREATE INDEX IF NOT EXISTS reminders_created_at_idx ON reminders (created_at DESC);

-- Availability Table
CREATE TABLE IF NOT EXISTS crew_availability (
  id              TEXT        PRIMARY KEY,
  crew_id         TEXT        NOT NULL,
  date            DATE        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'available',
  notes           TEXT        NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(crew_id, date)
);

-- Indexes for availability
CREATE INDEX IF NOT EXISTS crew_availability_crew_date_idx ON crew_availability (crew_id, date);
CREATE INDEX IF NOT EXISTS crew_availability_status_idx ON crew_availability (status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crews_updated_at ON crews;
CREATE TRIGGER update_crews_updated_at
  BEFORE UPDATE ON crews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_templates_updated_at ON job_templates;
CREATE TRIGGER update_job_templates_updated_at
  BEFORE UPDATE ON job_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_job_instances_updated_at ON recurring_job_instances;
CREATE TRIGGER update_recurring_job_instances_updated_at
  BEFORE UPDATE ON recurring_job_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crew_availability_updated_at ON crew_availability;
CREATE TRIGGER update_crew_availability_updated_at
  BEFORE UPDATE ON crew_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
