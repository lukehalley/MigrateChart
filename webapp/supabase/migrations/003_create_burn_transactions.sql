-- Create burn_transactions table to store historical ZERA token burns
-- This eliminates the need to paginate through thousands of transactions

CREATE TABLE IF NOT EXISTS burn_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  signature TEXT NOT NULL UNIQUE,
  timestamp BIGINT NOT NULL,
  amount NUMERIC(20, 9) NOT NULL,
  from_account TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_burn_signature UNIQUE (signature)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_burn_transactions_project_timestamp
  ON burn_transactions(project_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_burn_transactions_signature
  ON burn_transactions(signature);

-- Add comment
COMMENT ON TABLE burn_transactions IS 'Stores historical protocol burn transactions for tokens';
