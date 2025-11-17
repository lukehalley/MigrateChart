# Holder Collection Cron Job Setup

The holder tracking system requires hourly data collection. Vercel cron jobs **only work on paid plans**. Here are your options:

## Current Status
- ✅ Cron endpoint works: `/api/cron/collect-holders`
- ✅ Authentication configured with CRON_SECRET
- ❌ Vercel free plan doesn't execute scheduled crons
- ⚠️ Manual triggers work, but automatic hourly collection doesn't run

## Option 1: Upgrade Vercel to Pro (Recommended)

**Cost:** $20/month
**Setup:** None required - crons work automatically

1. Go to [Vercel Dashboard](https://vercel.com/migrate-chart/zera-chart/settings/general)
2. Upgrade to Pro plan
3. Crons will start running automatically

**Pros:**
- Zero setup
- Reliable execution
- Built-in monitoring
- No external dependencies

**Cons:**
- $20/month cost

## Option 2: GitHub Actions (Free)

**Cost:** Free
**Setup:** 2 minutes

The GitHub Action has already been created at `.github/workflows/collect-holders.yml`.

### Setup Steps:

1. **Add Secret to GitHub:**
   ```bash
   # Go to: https://github.com/Trenchooooor/zera_chart/settings/secrets/actions
   # Click "New repository secret"
   # Name: CRON_SECRET
   # Value: <your CRON_SECRET from .env.local>
   ```

2. **Commit and push the workflow:**
   ```bash
   git add .github/workflows/collect-holders.yml
   git commit -m "feat: add GitHub Actions cron for holder collection"
   git push
   ```

3. **Verify it works:**
   - Go to: https://github.com/Trenchooooor/zera_chart/actions
   - Click "Collect Holder Snapshots"
   - Click "Run workflow" to test manually
   - Check for successful execution

**Pros:**
- Free
- Reliable (GitHub's infrastructure)
- Version controlled
- Can view execution history

**Cons:**
- Depends on GitHub
- May have slight delays (±10 minutes typical for free tier)

## Option 3: External Cron Service (Free)

**Cost:** Free
**Setup:** 5 minutes

Use a service like **cron-job.org** or **EasyCron**.

### cron-job.org Setup:

1. Go to [cron-job.org](https://cron-job.org)
2. Create a free account
3. Click "Create Cronjob"
4. Configure:
   - **URL:** `https://migrate-chart.fun/api/cron/collect-holders`
   - **Schedule:** Every 1 hour
   - **Method:** GET
   - **Headers:**
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
5. Save and enable

**Pros:**
- Free
- Simple to set up
- Web UI for monitoring
- Email notifications on failures

**Cons:**
- Depends on external service
- May have reliability issues
- Limited to 100 requests/day on free plan (sufficient for hourly = 24/day)

### EasyCron Setup:

1. Go to [easycron.com](https://www.easycron.com)
2. Create free account
3. Add new cron job:
   - **URL:** `https://migrate-chart.fun/api/cron/collect-holders`
   - **Cron Expression:** `0 * * * *` (every hour)
   - **Custom Headers:**
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
4. Save and enable

## Option 4: Keep Vercel Cron Config (For Later)

If you plan to upgrade to Vercel Pro later, keep `vercel.json` as-is. The cron configuration will automatically activate when you upgrade.

## Verification

After setting up any option, verify it's working:

1. **Wait 1-2 hours** for automatic collection
2. **Check the data:**
   ```bash
   curl "https://migrate-chart.fun/api/holders/zera?timeframe=ALL"
   ```
3. **Check Supabase:**
   ```sql
   SELECT
     COUNT(*) as total,
     MIN(timestamp) as first,
     MAX(timestamp) as latest
   FROM holder_snapshots;
   ```

You should see new snapshots appearing every hour.

## Manual Trigger (For Testing)

You can always manually trigger collection:

```bash
curl -X GET "https://migrate-chart.fun/api/cron/collect-holders" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Recommendation

**For now:** Use **GitHub Actions (Option 2)** - it's free and reliable.

**For production:** Consider **Vercel Pro (Option 1)** if you plan to scale or want the simplest solution.

## Current Vercel Config

The `vercel.json` cron configuration is already set up:

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

This will work automatically once you're on a paid Vercel plan, or you can use one of the free alternatives above.
