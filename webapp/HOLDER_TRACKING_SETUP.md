# Holder Tracking Setup Guide

## Overview
This document describes the holder tracking system that has been set up to collect and display time-series data of token holder counts.

## Architecture

### 1. Database Layer
**File:** `supabase/migrations/001_create_holder_snapshots.sql`
- Creates `holder_snapshots` table to store periodic snapshots
- Includes indexes for efficient querying
- Composite unique constraint prevents duplicate snapshots
- RLS (Row Level Security) enabled

**Schema:**
```sql
- project_id: TEXT (e.g., 'zera', 'm0n3y')
- token_address: TEXT (Solana token address)
- holder_count: INTEGER (number of unique holders)
- timestamp: BIGINT (Unix timestamp in seconds)
- created_at: TIMESTAMP WITH TIME ZONE
```

### 2. Service Layer
**File:** `lib/holderSnapshotService.ts`

**Functions:**
- `saveHolderSnapshot()` - Save a new snapshot
- `getHolderSnapshots()` - Retrieve snapshots for time range
- `getLatestHolderSnapshot()` - Get most recent snapshot
- `cleanupOldSnapshots()` - Remove old data (365 day retention)

### 3. Data Collection (Cron Job)
**File:** `app/api/cron/collect-holders/route.ts`
- Runs hourly (configured in vercel.json)
- Collects holder counts for all projects
- Saves snapshots to database
- Returns collection status and results

**Security:**
- Requires `CRON_SECRET` environment variable
- Uses Bearer token authentication

### 4. Data Retrieval API
**File:** `app/api/holders/[slug]/route.ts`
- GET endpoint: `/api/holders/[slug]?timeframe=7D|30D|90D|ALL`
- Returns holder snapshots for specified timeframe
- Includes current holder count and statistics

### 5. Visualization Component
**File:** `components/HoldersView.tsx`
- 4-chart grid layout (like FeesView)
- Charts:
  1. Holder Growth Line Chart
  2. Cumulative Holder Area Chart
  3. Daily Holder Change Chart
  4. Statistics Summary Card
- Responsive design (mobile + desktop)
- Shows message when no data available yet

### 6. Vercel Cron Configuration
**File:** `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/collect-holders",
      "schedule": "0 * * * *"
    }
  ]
}
```
**Schedule:** Every hour at the top of the hour (e.g., 1:00, 2:00, 3:00)

## Deployment Steps

### Step 1: Run Database Migration
You need to run the SQL migration to create the holder_snapshots table in Supabase:

```bash
# Option A: Using Supabase CLI
supabase migration up

# Option B: Manual - Copy contents of supabase/migrations/001_create_holder_snapshots.sql
# and run in Supabase SQL Editor
```

### Step 2: Set Environment Variables
Add to your Vercel project settings or `.env.local`:

```bash
# Supabase (should already be configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cron Job Security (NEW - REQUIRED)
CRON_SECRET=your_random_secure_string
```

**Generate CRON_SECRET:**
```bash
openssl rand -base64 32
```

### Step 3: Deploy to Vercel
```bash
git add .
git commit -m "feat: add holder tracking system with hourly cron collection"
git push
```

Vercel will automatically:
- Deploy the code
- Set up the cron job (runs hourly)
- Start collecting holder data

### Step 4: Verify Cron Job
After deployment, check that the cron job is working:

1. Go to Vercel Dashboard > Your Project > Cron Jobs
2. You should see the `/api/cron/collect-holders` job listed
3. Wait for the next hour to let it run automatically, OR
4. Trigger manually: Click "Trigger" button in Vercel Dashboard

### Step 5: Monitor Data Collection
Check if data is being collected:

1. Query Supabase database:
```sql
SELECT * FROM holder_snapshots ORDER BY timestamp DESC LIMIT 10;
```

2. Or visit the API endpoint:
```
https://your-domain.com/api/holders/zera?timeframe=ALL
```

## Integration with Main Dashboard

### TODO: Add Holders View to Main Page

The HoldersView component has been created but needs to be integrated into the main page (`app/[token]/page.tsx`). Here's what needs to be done:

1. **Add holders timeframe state:**
```typescript
const [holdersTimeframe, setHoldersTimeframeState] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');
```

2. **Update view mode type to include 'holders':**
```typescript
const [viewMode, setViewModeState] = useState<'chart' | 'fees' | 'holders'>(initialViewMode);
```

3. **Add third button to View Mode Switch** (both mobile and desktop versions)

4. **Add holders timeframe toggle** (show when viewMode === 'holders')

5. **Add HoldersView to AnimatePresence blocks** (both mobile and desktop):
```typescript
{viewMode === 'holders' && (
  <motion.div key="holders" ...>
    <HoldersView
      projectSlug={currentProject.slug}
      primaryColor={currentProject.primaryColor}
      timeframe={holdersTimeframe}
      onTimeframeChange={setHoldersTimeframe}
      onOpenMobileMenu={() => setShowMobileMenu(true)}
    />
  </motion.div>
)}
```

6. **Import HoldersView component:**
```typescript
import { HoldersView } from '@/components/HoldersView';
```

## Data Collection Timeline

- **First snapshot:** Collected when cron first runs after deployment
- **Frequency:** Hourly (24 snapshots per day)
- **Visibility:** Charts appear once there are at least 2 data points
- **Full data:** 7D timeframe needs ~7 days of collection
- **Retention:** Data kept for 365 days (configurable)

## API Endpoints Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/cron/collect-holders` | GET | Collect holder snapshots (cron) | Bearer token |
| `/api/holders/[slug]` | GET | Retrieve holder time-series | None |

## Troubleshooting

### No data appearing in charts
1. Check if cron job is running in Vercel Dashboard
2. Verify CRON_SECRET is set correctly
3. Check Supabase for data: `SELECT COUNT(*) FROM holder_snapshots;`
4. Check Vercel Function Logs for errors

### Cron job failing
1. Verify CRON_SECRET matches in both:
   - Vercel Environment Variables
   - Cron job configuration
2. Check Supabase connection (URL and Key)
3. Review function logs in Vercel Dashboard

### "Holder Tracking Starting Soon" message persists
- This is normal! It means data collection is working but there aren't enough snapshots yet
- Wait for the hourly cron to collect more data points
- Charts appear once there are at least 2 snapshots

## Future Enhancements

1. **Manual Trigger Button:** Add UI button to manually trigger snapshot collection (admin only)
2. **Backfill Historical Data:** If blockchain data is available, backfill historical holder counts
3. **Notifications:** Alert when holder milestones are reached
4. **Comparison View:** Compare holder growth across different tokens
5. **Growth Rate Metrics:** Calculate and display daily/weekly growth rates
6. **Holder Distribution:** Track holder tier distribution (whales, dolphins, shrimp)

## Files Modified/Created

### New Files
- `supabase/migrations/001_create_holder_snapshots.sql`
- `lib/holderSnapshotService.ts`
- `app/api/cron/collect-holders/route.ts`
- `app/api/holders/[slug]/route.ts`
- `components/HoldersView.tsx`
- `vercel.json`

### Files to Modify (Not yet done)
- `app/[token]/page.tsx` - Add holders view integration
- `components/ui/skeleton.tsx` - May need to create this if it doesn't exist
