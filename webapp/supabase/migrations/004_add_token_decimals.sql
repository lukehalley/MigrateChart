-- Add token_decimals column to projects table
-- This is needed to properly convert raw token amounts to human-readable amounts

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS token_decimals INTEGER NOT NULL DEFAULT 9;

COMMENT ON COLUMN projects.token_decimals IS 'Number of decimals for the token (default: 9 for SPL tokens)';

-- Update ZERA project to have 9 decimals (standard SPL token)
UPDATE projects
SET token_decimals = 9
WHERE slug = 'zera';
