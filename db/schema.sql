-- The company site's database: the "Book a free call" requests.
-- Safe to run more than once: every statement is IF NOT EXISTS.
-- Run it with: npm run db:migrate

CREATE TABLE IF NOT EXISTS call_requests (
  id text PRIMARY KEY,
  ref text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  business text NOT NULL,
  contact text NOT NULL,
  contact_kind text NOT NULL,
  kit text[] NOT NULL DEFAULT '{}',
  preferred_time text NOT NULL,
  source text NOT NULL DEFAULT 'form',
  utm jsonb,
  status text NOT NULL DEFAULT 'new',
  notes text NOT NULL DEFAULT '',
  CONSTRAINT call_requests_ref_key UNIQUE (ref),
  CONSTRAINT call_requests_status_check CHECK (status IN ('new', 'contacted', 'call_done', 'won', 'lost')),
  CONSTRAINT call_requests_source_check CHECK (source IN ('form', 'ogi')),
  CONSTRAINT call_requests_contact_kind_check CHECK (contact_kind IN ('phone', 'email'))
);

CREATE INDEX IF NOT EXISTS call_requests_created_at_idx ON call_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS call_requests_status_idx ON call_requests (status);
