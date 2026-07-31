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
                              CHECK (status IN ('backlog', 'scheduled')),
  day             TEXT,
  crew_id         TEXT,
  lat             NUMERIC(10, 6),
  lng             NUMERIC(10, 6),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimized indexes for crew queries
CREATE INDEX IF NOT EXISTS crews_id_idx ON crews (id);
CREATE INDEX IF NOT EXISTS crews_name_idx ON crews (name);
CREATE INDEX IF NOT EXISTS crews_tickets_idx ON crews USING GIN (tickets);
CREATE INDEX IF NOT EXISTS crews_base_location_idx ON crews (base_location);
CREATE INDEX IF NOT EXISTS crews_created_at_idx ON crews (created_at DESC);

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
