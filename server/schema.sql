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
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS jobs_status_idx  ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_crew_id_idx ON jobs (crew_id);

CREATE TABLE IF NOT EXISTS crews (
  id            TEXT        PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL DEFAULT '',
  phone         TEXT        NOT NULL DEFAULT '',
  color         TEXT        NOT NULL DEFAULT '',
  tickets       JSONB       NOT NULL DEFAULT '["WAH"]',
  base_location TEXT        NOT NULL DEFAULT '',
  notes         TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
