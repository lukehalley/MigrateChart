# GitHub Actions Cron Jobs

This directory contains GitHub Actions workflows that replace Vercel Cron Jobs for more reliable scheduled task execution.

## Workflows

### 1. Collect Holders (Hourly)
- **File**: `cron-collect-holders.yml`
- **Schedule**: Every hour at minute 0 (`0 * * * *`)
- **Purpose**: Collects holder snapshot data for all tracked projects
- **Timeout**: Default (6 hours)

### 2. Sync Migrations (Daily)
- **File**: `cron-sync-migrations.yml`
- **Schedule**: Daily at midnight UTC (`0 0 * * *`)
- **Purpose**: Syncs active migration data from migrate.fun
- **Timeout**: 10 minutes

### 3. Sync Burns (Hourly)
- **File**: `cron-sync-burns.yml`
- **Schedule**: Every hour at minute 0 (`0 * * * *`)
- **Purpose**: Syncs burn transaction data from Solana
- **Timeout**: 5 minutes

## Setup Instructions

### 1. Configure GitHub Secret

Add the `CRON_SECRET` to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `CRON_SECRET`
4. Value: `VczN782nbKEblnyTCVnP89HnFsqNH+6qyBfdBgNsEk8=`
5. Click **Add secret**

### 2. Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. If prompted, click **I understand my workflows, go ahead and enable them**
3. Verify the workflows appear in the list

### 3. Test Manual Execution

You can manually trigger any workflow:

1. Go to **Actions** tab
2. Select a workflow from the left sidebar
3. Click **Run workflow** dropdown
4. Click **Run workflow** button

### 4. Monitor Execution

View workflow runs:

1. Go to **Actions** tab
2. Click on a workflow to see its history
3. Click on a specific run to see logs and results

## Why GitHub Actions Instead of Vercel Crons?

**Advantages:**
- ✅ Free on public repositories
- ✅ More reliable scheduling (exact minute execution)
- ✅ Better logging and monitoring
- ✅ Manual triggering via UI
- ✅ No Vercel plan limitations
- ✅ Version controlled workflow definitions
- ✅ Easier debugging with full logs

**Considerations:**
- GitHub Actions have a 6-hour maximum runtime per job (sufficient for these crons)
- Workflows may be delayed by up to 3 minutes during high load
- Manual trigger allows testing without waiting for schedule

## Troubleshooting

### Workflow Not Running

1. Check that GitHub Actions are enabled for your repository
2. Verify the `CRON_SECRET` is correctly set in repository secrets
3. Check the **Actions** tab for any error messages

### 401 Unauthorized Error

The `CRON_SECRET` is missing or incorrect:
1. Verify the secret value matches what's configured in Vercel environment variables
2. Ensure the secret name is exactly `CRON_SECRET` (case-sensitive)

### 500 Internal Server Error

The API endpoint is experiencing issues:
1. Check the Vercel deployment logs
2. Verify the production URL is `https://migrate-chart.fun`
3. Test the endpoint manually with curl

### Workflow Times Out

If a workflow consistently times out:
1. Check the API endpoint performance
2. Consider increasing the `timeout-minutes` value
3. Review logs to identify bottlenecks

## Manual Testing

Test any cron endpoint locally:

```bash
curl -X GET "https://migrate-chart.fun/api/cron/collect-holders" \
  -H "Authorization: Bearer VczN782nbKEblnyTCVnP89HnFsqNH+6qyBfdBgNsEk8="
```

Replace the endpoint path for different crons:
- `/api/cron/collect-holders`
- `/api/cron/sync-migrations`
- `/api/cron/sync-burns`
