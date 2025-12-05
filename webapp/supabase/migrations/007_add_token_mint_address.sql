-- Add token_mint_address column to projects table
-- This is the SPL token mint address, used to track ALL burns for this token
-- regardless of which wallet performs the burn

ALTER TABLE projects ADD COLUMN IF NOT EXISTS token_mint_address TEXT;

-- Update ZERA project with its token mint address
UPDATE projects
SET token_mint_address = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA'
WHERE slug = 'zera';

-- Add comment for documentation
COMMENT ON COLUMN projects.token_mint_address IS 'SPL token mint address - used to track ALL burn transactions for this token from any wallet';
