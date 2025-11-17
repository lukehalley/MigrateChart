-- Migration: Create holder_snapshots table for time-series tracking
-- This table stores periodic snapshots of holder counts for each token

CREATE TABLE IF NOT EXISTS holder_snapshots (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  token_address TEXT NOT NULL,
  holder_count INTEGER NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Composite unique constraint to prevent duplicate snapshots
  UNIQUE (project_id, token_address, timestamp)
);

-- Index for efficient queries by project and token
CREATE INDEX IF NOT EXISTS idx_holder_snapshots_project_token
  ON holder_snapshots (project_id, token_address, timestamp DESC);

-- Index for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_holder_snapshots_timestamp
  ON holder_snapshots (timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE holder_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on holder_snapshots"
  ON holder_snapshots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE holder_snapshots IS 'Stores time-series snapshots of token holder counts for tracking growth over time';
COMMENT ON COLUMN holder_snapshots.project_id IS 'Project identifier (e.g., zera, m0n3y)';
COMMENT ON COLUMN holder_snapshots.token_address IS 'Solana token address';
COMMENT ON COLUMN holder_snapshots.holder_count IS 'Number of unique holders at this timestamp';
COMMENT ON COLUMN holder_snapshots.timestamp IS 'Unix timestamp (seconds) when snapshot was taken';
