-- Add burns_enabled column to projects table
-- This enables the Burns tracking feature for specific tokens (ZERA)

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS burns_enabled BOOLEAN DEFAULT false;

-- Enable burns tracking for ZERA project
UPDATE projects
SET burns_enabled = true
WHERE slug = 'zera';

-- Add comment to explain the column
COMMENT ON COLUMN projects.burns_enabled IS 'Enable burns tracking view for this project';
