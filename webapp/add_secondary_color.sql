-- Add secondaryColor column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "secondaryColor" TEXT DEFAULT '#000000';

-- Update existing projects
UPDATE projects SET "secondaryColor" = '#000000' WHERE slug = 'zera';
UPDATE projects SET "secondaryColor" = '#FFFFFF' WHERE slug = 'payai';
