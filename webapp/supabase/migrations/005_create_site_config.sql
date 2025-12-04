-- Create site_config table for centralized configuration
-- This allows sharing configuration values across all projects

CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the global donation address
INSERT INTO site_config (key, value, description)
VALUES (
  'donation_address',
  'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb',
  'Global Solana wallet address for donations across all projects'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = NOW();

-- Update all existing projects to use the centralized donation address
UPDATE projects
SET donation_address = 'G9fXGu1LvtZesdQYjsWQTj1QeMpc97CJ6vWhX3rgeapb',
    updated_at = NOW();

-- Add comment explaining the change
COMMENT ON TABLE site_config IS 'Global site configuration table for values shared across all projects';
COMMENT ON COLUMN site_config.key IS 'Unique configuration key identifier';
COMMENT ON COLUMN site_config.value IS 'Configuration value';
