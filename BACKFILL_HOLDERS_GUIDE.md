# Backfilling Historical Holder Data

This guide explains how to manually insert historical holder data into the system.

## Overview

The holder tracking system currently collects data hourly via cron. To populate historical data, you have several options:

## Option 1: Use the Backfill Script (Recommended)

### Step 1: Prepare Your Data

Edit `webapp/scripts/backfill-holders.ts` and add your historical snapshots:

```typescript
const historicalData: HistoricalSnapshot[] = [
  {
    projectId: '49fd8ab1-e85b-445f-9f92-defa0d46363a',
    tokenAddress: '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA',
    holderCount: 4500,
    timestamp: dateToTimestamp('2025-01-10T12:00:00Z'),
  },
  {
    projectId: '49fd8ab1-e85b-445f-9f92-defa0d46363a',
    tokenAddress: '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA',
    holderCount: 4520,
    timestamp: dateToTimestamp('2025-01-11T12:00:00Z'),
  },
];
```

**Finding Your Project ID:**
```bash
# Visit or fetch:
curl https://migrate-chart.fun/api/projects/zera
# Look for the "id" field in the response
```

**Finding Your Token Address:**
```bash
# Visit or fetch:
curl https://migrate-chart.fun/api/projects/zera
# Look for the last pool's "tokenAddress" field
```

### Step 2: Run the Script

```bash
cd webapp
npx tsx scripts/backfill-holders.ts
```

**Output Example:**
```
🚀 Starting backfill process...
📊 Total snapshots to insert: 100

✅ Backfill completed!
📈 Inserted: 100 / 100

Results:
---
✅ 2025-01-10T12:00:00.000Z - Success
✅ 2025-01-11T12:00:00.000Z - Success
...
```

## Option 2: Use the API Directly

Send a POST request to the backfill endpoint:

```bash
curl -X POST https://migrate-chart.fun/api/admin/backfill-holders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -d '{
    "snapshots": [
      {
        "projectId": "49fd8ab1-e85b-445f-9f92-defa0d46363a",
        "tokenAddress": "8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA",
        "holderCount": 4500,
        "timestamp": 1705190400
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "inserted": 1,
  "total": 1,
  "results": [
    {
      "projectId": "49fd8ab1-e85b-445f-9f92-defa0d46363a",
      "tokenAddress": "8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA",
      "timestamp": 1705190400,
      "success": true
    }
  ]
}
```

## Option 3: Direct SQL Insertion (Advanced)

If you have direct database access via Supabase:

```sql
INSERT INTO holder_snapshots (project_id, token_address, holder_count, timestamp)
VALUES
  ('49fd8ab1-e85b-445f-9f92-defa0d46363a', '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA', 4500, 1705190400),
  ('49fd8ab1-e85b-445f-9f92-defa0d46363a', '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA', 4520, 1705276800)
ON CONFLICT (project_id, token_address, timestamp) DO UPDATE
  SET holder_count = EXCLUDED.holder_count;
```

## Data Sources for Historical Holder Counts

Unfortunately, there are **limited options** for retrieving historical holder counts on Solana:

### Available (but Limited):
1. **Manual Records** - If you tracked holder counts manually
2. **DEXScreener API** - May have historical holder data for popular tokens
3. **Your Own Snapshots** - If you have any backups or logs

### NOT Available:
- **Jupiter API** - Only provides current holder count, no historical data
- **Helius API** - Can query holders at a point in time, but expensive and requires archive node access
- **Bitquery** - Has historical holder data but requires paid subscription

### Recommended Approach:

**For Recent History (Last 7-30 Days):**
If you need to backfill just the last few days/weeks, you can:
1. Estimate based on current growth rate
2. Use linear interpolation between known points
3. Start collecting from now and wait for organic data

**For Older History:**
Unless you have manual records, it's better to:
1. Start collecting data from now
2. Show "Collecting data..." message for historical views
3. Charts will naturally fill in over time

## Generating Sample Data (For Testing)

If you want to generate sample historical data for testing:

```typescript
// Generate hourly snapshots for the last 30 days
const historicalData: HistoricalSnapshot[] = [];
const now = Math.floor(Date.now() / 1000);
const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
const startingHolders = 4000;
const currentHolders = 4629;
const growthPerHour = (currentHolders - startingHolders) / (30 * 24);

for (let i = 0; i < 30 * 24; i++) {
  const timestamp = thirtyDaysAgo + (i * 60 * 60);
  const holderCount = Math.floor(startingHolders + (growthPerHour * i));

  historicalData.push({
    projectId: '49fd8ab1-e85b-445f-9f92-defa0d46363a',
    tokenAddress: '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA',
    holderCount,
    timestamp,
  });
}
```

## Validation

After backfilling, verify the data:

```bash
# Check via API
curl "https://migrate-chart.fun/api/holders/zera?timeframe=ALL"

# Or check in Supabase SQL Editor
SELECT
  COUNT(*) as total_snapshots,
  MIN(timestamp) as earliest,
  MAX(timestamp) as latest,
  MIN(holder_count) as min_holders,
  MAX(holder_count) as max_holders
FROM holder_snapshots
WHERE project_id = '49fd8ab1-e85b-445f-9f92-defa0d46363a'
  AND token_address = '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA';
```

## Important Notes

1. **Timestamps must be in the past** - The API will reject future timestamps
2. **Unique constraint** - Cannot insert duplicate (project_id, token_address, timestamp) combinations
3. **Upsert behavior** - If a snapshot already exists, it will be updated
4. **Authentication required** - Must use CRON_SECRET for security
5. **No automatic data fetching** - This system does not automatically fetch historical holder counts; you must provide the data

## Troubleshooting

### Error: "Unauthorized"
- Check that CRON_SECRET matches between your .env and the request

### Error: "Timestamp cannot be in the future"
- Verify timestamps are in Unix seconds, not milliseconds
- Ensure timestamps are in the past

### Error: "Missing required fields"
- Verify all fields are present: projectId, tokenAddress, holderCount, timestamp

### Script fails to run
- Make sure you're in the webapp directory
- Install tsx: `npm install -D tsx`
- Check that .env.local has CRON_SECRET set

## Security

The backfill endpoint is protected by:
- Bearer token authentication (CRON_SECRET)
- Validation of timestamp ranges
- Upsert to prevent duplicates

Keep your CRON_SECRET secure and never commit it to git.
