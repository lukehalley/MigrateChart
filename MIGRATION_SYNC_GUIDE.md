# Automated Migration Sync Guide

## Overview

This system **automatically** syncs active token migrations from [migrate.fun](https://migrate.fun) into your chart platform. When a new migration appears on migrate.fun, it can be added to your app with a single command or automatically via cron job.

## How PAYAI Was Manually Added (The Old Way)

### Manual Process Summary

1. **Created database records** in Supabase:
   - Added project record with branding (colors, logo, slug)
   - Added 2 pool records (V1 old token, V2 new token)
   - Added migration record linking the pools

2. **Uploaded assets**:
   - Uploaded `payai.avif` logo to Supabase Storage
   - Uploaded `payai.svg` loader animation to Supabase Storage

3. **Backfilled historical data**:
   - Ran `backfill_payai_v1.js` script to fetch OHLC data from Jupiter
   - Populated `ohlc_cache` table with historical prices

### Manual SQL Example

```sql
-- 1. Insert project
INSERT INTO projects (slug, name, primary_color, "secondaryColor", logo_url, loader_url, donation_address)
VALUES (
  'payai',
  'PayAI',
  '#6F8AE9',
  '#FFFFFF',
  'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/payai.avif',
  'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-loaders/payai.svg',
  'PAYmo6moDF3Ro3X6bU2jwe2UdBnBhv8YjLgL1j4DxGu'
);

-- 2. Insert pools
INSERT INTO pools (project_id, pool_address, token_address, token_symbol, pool_name, dex_type, order_index, fee_rate)
VALUES
  ('{project_id}', 'AQcBbrw...', 'E7NgL19...', 'PAYAI', 'PayAI V1', 'Raydium', 0, 0.008),
  ('{project_id}', 'CP8fLux...', 'PAYmo6m...', 'PAYAI', 'PayAI V2', 'Raydium', 1, 0.008);

-- 3. Insert migration
INSERT INTO migrations (project_id, from_pool_id, to_pool_id, migration_timestamp, label)
VALUES ('{project_id}', '{v1_id}', '{v2_id}', 1762279200, 'Token V2 Migration');
```

---

## The New Automated Way

### Quick Start

```bash
# 1. Check what migrations need syncing
cd webapp
npm run sync-migrations:stats

# 2. Preview changes without committing (dry run)
npm run sync-migrations:dry-run

# 3. Actually sync the migrations
npm run sync-migrations
```

### What It Does Automatically

1. **Fetches active migrations** from migrate.fun's Solana program
2. **Checks if migration exists** in your database
3. **For new migrations**:
   - Fetches token metadata from Jupiter API
   - Generates slug from project name
   - Creates project record (with default colors)
   - Creates 2 pool records (old token V1, new token V2)
   - Creates migration record linking them
   - Backfills historical OHLC data from Jupiter API
4. **Skips existing migrations** to avoid duplicates

---

## Architecture

### Components

1. **`migrateFunApi.ts`** - Fetches migration data from blockchain
   - `fetchActiveProjects()` - Gets currently active migrations
   - `fetchRecentClaims()` - Gets recently ended migrations
   - Parses on-chain binary data

2. **`migrationSyncService.ts`** - Main sync logic
   - `syncActiveMigrations()` - Processes all active migrations
   - `syncSingleMigration()` - Manually sync one migration
   - `createProject()` - Creates complete project setup
   - `backfillOHLCData()` - Fetches historical price data

3. **`scripts/sync-migrations.ts`** - CLI interface
   - Manual sync with progress reporting
   - Dry-run mode for testing
   - Statistics mode

4. **`api/cron/sync-migrations/route.ts`** - Automated endpoint
   - Triggered daily by Vercel Cron
   - Authenticated with `CRON_SECRET`
   - 5-minute max execution time

### Data Flow

```
migrate.fun (Solana)
    │
    ├─> migrateFunApi.fetchActiveProjects()
    │
    └─> migrationSyncService.syncActiveMigrations()
         │
         ├─> For each new migration:
         │    │
         │    ├─> fetchTokenMetadata() (Jupiter API)
         │    ├─> Create project record
         │    ├─> Create pool records (V1 & V2)
         │    ├─> Create migration record
         │    └─> backfillOHLCData() (Jupiter API)
         │
         └─> Returns: { added[], skipped[], errors[] }
```

---

## Current Active Migrations

As of November 2025, migrate.fun has **2 active migrations**:

### 1. MEMEVERSE Migration (mig77)
- **Period**: Nov 4 - Dec 4, 2025
- **Old Token**: `25a11Sn2bfV1qLJJvhbq8KXiCv1j1EZ6bBPCnEYrFRQz`
- **New Token**: `5umdEnYVe9c7YsGWzBAW1xbBGYDF6BwW8qruFmmPbonk`
- **URL**: https://migrate.fun/migrate/mig77

### 2. BAOBAO Migration (mig76)
- **Period**: Nov 4 - Nov 25, 2025
- **Old Token**: `BqykGfvujSYW4vWZjvKHKPeJdArv69cSRaQdAL216ne8`
- **New Token**: `4bXCaDUciWA5Qj1zmcZ9ryJsoqv4rahKD4r8zYYsbonk`
- **URL**: https://migrate.fun/migrate/mig76

---

## Commands

### Check Sync Status
```bash
npm run sync-migrations:stats
```
Shows how many migrations are on migrate.fun vs your database.

### Dry Run (Preview Changes)
```bash
npm run sync-migrations:dry-run
```
Shows what would be added without making any changes.

### Sync All Active Migrations
```bash
npm run sync-migrations
```
Adds any new active migrations to your database.

### Sync Single Migration (For Testing)
```bash
npx tsx scripts/sync-migrations.ts --migration mig77
```
Adds only the specified migration.

---

## Cron Job (Automated Daily Sync)

The cron job runs automatically **once per day at midnight UTC** via Vercel Cron.

### Configuration

**File**: `webapp/vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-migrations",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Authentication

The cron endpoint requires authentication via `CRON_SECRET` environment variable:

1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add to Vercel:
   ```bash
   vercel env add CRON_SECRET
   # Paste the generated secret
   ```

3. Also add `SUPABASE_SERVICE_ROLE_KEY`:
   ```bash
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # Get from Supabase Dashboard → Settings → API
   ```

### Testing the Cron Endpoint

```bash
# Local test (requires .env.local with CRON_SECRET)
curl http://localhost:3000/api/cron/sync-migrations \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Production test
curl https://your-app.vercel.app/api/cron/sync-migrations \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Monitoring

Check Vercel logs for cron execution:
1. Go to Vercel Dashboard → Your Project → Logs
2. Filter by `/api/cron/sync-migrations`
3. Look for sync results in the response

---

## What Gets Created

For each new migration, the system creates:

### 1. Project Record
```typescript
{
  slug: 'memeverse',            // Generated from name
  name: 'MEMEVERSE',            // Cleaned project name
  primary_color: '#8C5CFF',     // Default purple (TODO: extract from logo)
  secondaryColor: '#FFFFFF',    // Default white
  logo_url: null,               // TODO: Sync from IPFS
  loader_url: null,             // Uses default loader
  donation_address: '5umdEn...', // New token mint
  is_default: false,
  is_active: true
}
```

### 2. Two Pool Records
```typescript
// Old Token (V1)
{
  project_id: '{uuid}',
  pool_address: '{old_mint}',  // Fallback to token address
  token_address: '{old_mint}',
  token_symbol: 'OLD',
  pool_name: 'OLD V1',
  dex_type: 'raydium',
  order_index: 0,
  fee_rate: 0.008
}

// New Token (V2)
{
  project_id: '{uuid}',
  pool_address: '{new_mint}',
  token_address: '{new_mint}',
  token_symbol: 'NEW',
  pool_name: 'NEW V2',
  dex_type: 'raydium',
  order_index: 1,
  fee_rate: 0.008
}
```

### 3. Migration Record
```typescript
{
  project_id: '{uuid}',
  from_pool_id: '{v1_uuid}',
  to_pool_id: '{v2_uuid}',
  migration_timestamp: 1730746800,
  label: 'OLD<br/>-><br/>NEW'
}
```

### 4. Historical OHLC Data
- ~500 daily candles per token (1D and MAX timeframes)
- ~1000 hourly candles per token (1H timeframe)
- Aggregated 4H and 8H data

---

## Limitations & TODOs

### Current Limitations

1. **No logo syncing** - Uses null/default for now
   - TODO: Fetch from IPFS and upload to Supabase Storage
   - Need to parse IPFS hash from token metadata

2. **Default colors** - All projects get purple (#8C5CFF)
   - TODO: Extract colors from logo using color-thief
   - Or allow manual color override

3. **No custom loaders** - Uses default loading animation
   - TODO: Generate simple SVG loaders
   - Or create loader templates

4. **Pool address fallback** - Uses token mint as pool address
   - Works for most cases but not ideal
   - TODO: Query Raydium/Jupiter for actual pool addresses

5. **No token amount parsing** - Migration progress shows as 0%
   - migrate.fun stores this data but parsing is complex
   - TODO: Decode on-chain token account balances

### Future Enhancements

1. **Asset Management**
   - Auto-fetch logos from IPFS
   - Extract dominant colors from logos
   - Generate themed loading animations

2. **Smart Duplicate Detection**
   - Check by project name similarity
   - Detect renamed projects
   - Merge duplicate entries

3. **Notification System**
   - Email when new migrations are added
   - Slack webhook for sync failures
   - Dashboard showing sync health

4. **Analytics**
   - Track which migrations get the most traffic
   - Monitor donation revenue per project
   - Show migration success rates

---

## Troubleshooting

### "Failed to fetch token metadata"
- Token might not be in Jupiter's token list
- Fallback values will be used (symbol: "UNKNOWN")
- Can manually update after sync

### "Failed to create project: duplicate key"
- Migration already exists in database
- Run with `--stats` to see current state
- Safe to ignore, will show as "skipped"

### "No data available for token"
- Token doesn't have Jupiter API data yet
- This is expected for new tokens
- Data will populate as trading occurs

### Cron job not running
- Check `CRON_SECRET` is set in Vercel
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify vercel.json has the cron config
- Check Vercel logs for errors

---

## Testing Workflow

### 1. Local Testing
```bash
# Install dependencies
cd webapp
npm install

# Set environment variables
cp .env.local.example .env.local
# Add: SUPABASE_SERVICE_ROLE_KEY=...

# Run sync
npm run sync-migrations:dry-run   # Preview changes
npm run sync-migrations            # Actually sync
```

### 2. Verify Results
```sql
-- Check projects were created
SELECT slug, name, primary_color FROM projects ORDER BY created_at DESC;

-- Check pools were created
SELECT p.slug, po.token_symbol, po.pool_name, po.order_index
FROM pools po
JOIN projects p ON po.project_id = p.id
ORDER BY p.slug, po.order_index;

-- Check migrations were created
SELECT p.slug, m.label, m.migration_timestamp
FROM migrations m
JOIN projects p ON m.project_id = p.id
ORDER BY p.created_at DESC;

-- Check OHLC data was backfilled
SELECT token_address, timeframe, COUNT(*) as candles
FROM ohlc_cache
GROUP BY token_address, timeframe
ORDER BY token_address, timeframe;
```

### 3. Test in Browser
```bash
# Start dev server
npm run dev

# Visit new project
open http://localhost:3000/?token=memeverse
```

---

## Deployment

### 1. Deploy to Vercel
```bash
# From project root
git push origin feat/migrate-fun-api

# Or deploy directly
vercel --prod
```

### 2. Set Environment Variables

Required in Vercel:
- `CRON_SECRET` - For cron authentication
- `SUPABASE_SERVICE_ROLE_KEY` - For database writes
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase key

### 3. Verify Cron Setup

1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see: `/api/cron/sync-migrations` scheduled for `0 0 * * *`
3. Click "Run now" to test immediately

---

## Monitoring

### Manual Check
```bash
# See what migrations are active
npm run sync-migrations:stats

# Output:
# Statistics:
#   Active on migrate.fun: 2
#   Already in database:   0
#   Needs sync:            2
```

### Cron Logs

Check Vercel logs for sync results:
```json
{
  "success": true,
  "result": {
    "added": 2,
    "skipped": 0,
    "errors": 0
  },
  "details": {
    "added": ["MEMEVERSE Migration", "BAOBAO Migration"],
    "skipped": [],
    "errors": []
  }
}
```

---

## Manual Override

If you want to customize a synced project:

```sql
-- Update colors
UPDATE projects
SET primary_color = '#FF5733', "secondaryColor" = '#000000'
WHERE slug = 'memeverse';

-- Upload custom logo
-- 1. Upload to Supabase Storage: project-logos/memeverse.avif
-- 2. Update record:
UPDATE projects
SET logo_url = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/memeverse.avif'
WHERE slug = 'memeverse';

-- Upload custom loader
-- 1. Upload SVG to Supabase Storage: project-loaders/memeverse.svg
-- 2. Update record:
UPDATE projects
SET loader_url = 'https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-loaders/memeverse.svg'
WHERE slug = 'memeverse';
```

---

## Files Reference

### Core Implementation
- `webapp/lib/migrateFunApi.ts` - Blockchain data fetcher
- `webapp/lib/services/migrationSyncService.ts` - Main sync logic
- `webapp/scripts/sync-migrations.ts` - CLI tool
- `webapp/app/api/cron/sync-migrations/route.ts` - Cron endpoint

### Configuration
- `webapp/vercel.json` - Cron schedule
- `webapp/package.json` - npm scripts

### Documentation
- `MIGRATE_FUN_INTEGRATION.md` - migrate.fun API details
- `AUTOMATED_MIGRATION_SYSTEM.md` - System architecture
- `MIGRATION_SYNC_GUIDE.md` - This file

---

## FAQ

**Q: Will it add migrations that have already ended?**
A: No, it only syncs migrations with status "Active".

**Q: What if I manually added a project and it conflicts?**
A: The system checks if pools exist and will skip if found.

**Q: Can I pause the automatic sync?**
A: Yes, remove the cron job from `vercel.json` and redeploy.

**Q: How do I remove a synced project?**
A: Set `is_active = false` in the projects table. Don't delete (breaks foreign keys).

**Q: What about old migrations in Claims status?**
A: Currently ignored. You can manually add important historical migrations.

---

## Next Steps

1. ✅ Automated migration detection
2. ✅ Database record creation
3. ✅ OHLC data backfill
4. ⏳ Logo syncing from IPFS
5. ⏳ Color extraction from logos
6. ⏳ Custom loader generation
7. ⏳ Migration progress tracking
8. ⏳ Notification system

---

## Support

For issues or questions:
1. Check this guide first
2. Review `MULTI_TENANT_GUIDE.md` for manual setup
3. Check Vercel logs for errors
4. Inspect database tables directly in Supabase
