-- Migration to support multiple burn program addresses per project
-- This allows tracking burns from multiple programs for the same token

-- Add new column for array of burn addresses
ALTER TABLE projects
ADD COLUMN burn_program_addresses TEXT[];

-- Migrate existing single address to array format
UPDATE projects
SET burn_program_addresses = ARRAY[burn_program_address]
WHERE burn_program_address IS NOT NULL;

-- Add comment
COMMENT ON COLUMN projects.burn_program_addresses IS 'Array of Solana program addresses where burn transactions occur';

-- Note: Keep burn_program_address column for backward compatibility
-- New code should use burn_program_addresses array
COMMENT ON COLUMN projects.burn_program_address IS 'Legacy single burn address - use burn_program_addresses array instead';
