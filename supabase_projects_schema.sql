-- Supabase Schema for Multi-Tenant Token Projects
-- This schema supports multiple token projects with custom branding and migration tracking

-- Projects table - Master configuration for each token
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  loader_svg TEXT NOT NULL,
  donation_address TEXT NOT NULL DEFAULT 'EfCy65hDD71pzcp7RwLCVq1NN2mmjhN1V4h6rwrrKx9R',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (slug ~ '^[a-z0-9-]+$'),  -- Only lowercase alphanumeric and hyphens
  CHECK (primary_color ~ '^#[0-9a-fA-F]{6}$'),  -- Valid hex color
  CHECK (donation_address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$')  -- Valid Solana address
);

-- Pools table - Pool/contract definitions per project
CREATE TABLE IF NOT EXISTS pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pool_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT NOT NULL,
  pool_name TEXT NOT NULL,
  dex_type TEXT NOT NULL,
  color TEXT,
  order_index INTEGER NOT NULL,
  fee_rate DECIMAL(10, 6) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (pool_address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'),  -- Valid Solana address
  CHECK (token_address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'),  -- Valid Solana address
  CHECK (order_index >= 0),
  CHECK (dex_type IN ('raydium', 'meteora', 'pump_fun', 'orca', 'jupiter')),

  -- Unique constraint to prevent duplicate pools per project
  UNIQUE(project_id, pool_address)
);

-- Migrations table - Migration events connecting pools
CREATE TABLE IF NOT EXISTS migrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_pool_id UUID REFERENCES pools(id) ON DELETE SET NULL,
  to_pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  migration_timestamp BIGINT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CHECK (migration_timestamp > 0)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(is_active);
CREATE INDEX IF NOT EXISTS idx_projects_default ON projects(is_default);
CREATE INDEX IF NOT EXISTS idx_pools_project ON pools(project_id);
CREATE INDEX IF NOT EXISTS idx_pools_order ON pools(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_migrations_project ON migrations(project_id);
CREATE INDEX IF NOT EXISTS idx_migrations_timestamp ON migrations(migration_timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access (for viewing projects)
CREATE POLICY "Allow public read access to active projects"
ON projects
FOR SELECT
USING (is_active = true);

CREATE POLICY "Allow public read access to pools"
ON pools
FOR SELECT
USING (true);

CREATE POLICY "Allow public read access to migrations"
ON migrations
FOR SELECT
USING (true);

-- Policy to allow authenticated admin inserts/updates/deletes
-- Note: You'll need to configure Supabase Auth and update these policies
-- to restrict to specific admin users/roles
CREATE POLICY "Allow admin inserts on projects"
ON projects
FOR INSERT
WITH CHECK (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin updates on projects"
ON projects
FOR UPDATE
USING (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin deletes on projects"
ON projects
FOR DELETE
USING (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin inserts on pools"
ON pools
FOR INSERT
WITH CHECK (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin updates on pools"
ON pools
FOR UPDATE
USING (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin deletes on pools"
ON pools
FOR DELETE
USING (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin inserts on migrations"
ON migrations
FOR INSERT
WITH CHECK (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin updates on migrations"
ON migrations
FOR UPDATE
USING (true);  -- TODO: Restrict to admin role

CREATE POLICY "Allow admin deletes on migrations"
ON migrations
FOR DELETE
USING (true);  -- TODO: Restrict to admin role

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default project
CREATE OR REPLACE FUNCTION ensure_single_default_project()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE projects SET is_default = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default project
CREATE TRIGGER enforce_single_default_project
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION ensure_single_default_project();

-- Create storage bucket for project logos
-- Run this in Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-logos', 'project-logos', true);
