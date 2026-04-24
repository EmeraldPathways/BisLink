CREATE TABLE app_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL CHECK (level IN ('log', 'warn', 'error')),
  source TEXT NOT NULL,
  event TEXT NOT NULL,
  message TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX app_logs_created_at_idx ON app_logs (created_at DESC);
