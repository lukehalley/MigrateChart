# Migrate Project Logos to Supabase Storage

## Step 1: Create Storage Buckets (Manual via Supabase Dashboard)

Go to: https://uxdhkdmneyskpkmcbjny.supabase.co/project/uxdhkdmneyskpkmcbjny/storage/buckets

1. **Create `project-logos` bucket:**
   - Name: `project-logos`
   - Public: ✓ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/svg+xml`, `image/png`, `image/jpeg`, `image/avif`

2. **Create `project-loaders` bucket:**
   - Name: `project-loaders`
   - Public: ✓ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/svg+xml`

## Step 2: Upload Files

### For Zera:
- Upload `zera.avif` to `project-logos/` (already exists)
- Upload Zera loader SVG to `project-loaders/zera.svg`

### For PayAI:
- Upload PayAI horizontal lockup to `project-logos/payai.svg`
- Upload PayAI horizontal lockup to `project-loaders/payai.svg`

## Step 3: Update Database Schema

```sql
-- Update projects table to use storage URLs
UPDATE projects 
SET 
  logo_url = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/zera.avif',
  loader_url = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-loaders/zera.svg'
WHERE slug = 'zera';

UPDATE projects 
SET 
  logo_url = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/payai.svg',
  loader_url = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-loaders/payai.svg'
WHERE slug = 'payai';

-- Add loader_url column if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS loader_url TEXT;

-- Eventually drop loader_svg column after migration
-- ALTER TABLE projects DROP COLUMN loader_svg;
```

## Step 4: Update Application Code

Update `TokenLoadingLogo.tsx` to fetch SVG from URL instead of using inline:
- Option A: Keep using inline SVG by fetching from `loader_url` and storing in state
- Option B: Use `<img>` tag with SVG URL (simpler but loses dynamic theming)

