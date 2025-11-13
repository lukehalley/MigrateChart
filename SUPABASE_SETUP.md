# Supabase OHLC Data Caching Setup

This guide will help you set up Supabase to cache historical OHLC (candlestick) data for the ZERA chart application.

## Benefits

- **Reduced API Calls**: Historical data is cached, reducing calls to Jupiter and GeckoTerminal APIs
- **Faster Load Times**: Cached data loads instantly without waiting for external APIs
- **Cost Savings**: Fewer API calls mean lower rate limiting and potential API costs
- **Resilience**: Cached data serves as a fallback if external APIs are unavailable

## Prerequisites

- A Supabase account (free tier works great!)
- Your Supabase project URL and anon key

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Give it a name (e.g., "zera-chart-cache")
4. Set a strong database password
5. Select a region close to your users
6. Click "Create new project"

### 2. Run the Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy and paste the entire contents of `supabase_schema.sql` (located in the root of this repository)
4. Click "Run" to execute the SQL

This creates:
- The `ohlc_cache` table to store candlestick data
- Indexes for fast queries
- Row Level Security policies for data access
- A cleanup function (optional, for maintenance)

### 3. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. Find your **Project URL** - it looks like: `https://xxxxx.supabase.co`
3. Find your **anon public** key - a long JWT token

### 4. Configure Environment Variables

Create or update the `.env.local` file in the `webapp` directory:

```bash
cd webapp
```

Add these lines to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from step 3.

### 5. Install Dependencies

Dependencies are already installed if you've run the setup, but to confirm:

```bash
npm install
```

### 6. Test the Setup

Start your development server:

```bash
npm run dev
```

Open your browser's developer console and look for log messages:
- `[Cache] Retrieved X candles from cache` - cache hit!
- `[API] Merged X cached + Y fresh = Z total candles` - successful merge
- `[Cache] Saved X candles to cache` - new data cached

## How It Works

### Caching Strategy

1. **Historical Data is Immutable**: Once a candlestick period is complete (e.g., a 1-hour candle from yesterday), it never changes
2. **Smart Caching**: The system only caches complete candles and always fetches the most recent incomplete candle fresh
3. **Automatic Cache Updates**: New complete candles are automatically saved to the cache
4. **Fallback Support**: If external APIs fail, the app falls back to cached data

### Cache Flow

```
User requests data
    ↓
Check cache for historical data
    ↓
Fetch fresh data from API (including latest incomplete candle)
    ↓
Merge cached + fresh data
    ↓
Save new complete candles to cache (async)
    ↓
Return merged data to user
```

### Data Storage

Each cached candle stores:
- `token_address`: The token being tracked
- `timeframe`: The candle timeframe (1H, 4H, 8H, 1D, MAX)
- `timestamp`: Unix timestamp of the candle
- `open`, `high`, `low`, `close`: Price data
- `volume`: Trading volume
- `created_at`: When the data was cached

## Monitoring

### Check Cache Status

You can query your cache in the Supabase SQL Editor:

```sql
-- See how many candles are cached per token/timeframe
SELECT
  token_address,
  timeframe,
  COUNT(*) as candle_count,
  MIN(timestamp) as earliest,
  MAX(timestamp) as latest
FROM ohlc_cache
GROUP BY token_address, timeframe
ORDER BY token_address, timeframe;
```

### Cache Size

```sql
-- Check total cache size
SELECT
  COUNT(*) as total_candles,
  pg_size_pretty(pg_total_relation_size('ohlc_cache')) as table_size
FROM ohlc_cache;
```

## Optional: Cache Cleanup

If you want to clean up very old cache entries (not usually needed):

```sql
-- Remove cache entries older than 1 year
SELECT cleanup_old_cache(365);
```

## Troubleshooting

### No cache hits?

1. Check that environment variables are set correctly
2. Verify the Supabase schema was created successfully
3. Look for error messages in the browser console
4. Check that RLS policies are enabled (they should be automatically)

### Cache not saving?

1. Verify your Supabase anon key has write permissions
2. Check the browser console for `[Cache] Error saving to cache` messages
3. Ensure the table was created with proper RLS policies

### Rate limiting still happening?

- The first load will still hit the API to populate the cache
- Subsequent loads should be much faster with cache hits
- Historical data should only be fetched once

## Cost Considerations

**Supabase Free Tier includes:**
- 500MB database storage
- 2GB bandwidth
- 50,000 monthly active users

For this caching use case, you'll likely stay well within the free tier limits:
- Each OHLC candle: ~100 bytes
- 3000 candles × 3 tokens × 5 timeframes = ~45,000 candles = ~4.5MB
- Far below the 500MB limit!

## Security Notes

- The `anon` key is safe to expose in your frontend (it's "public")
- Row Level Security (RLS) policies protect your data
- Only authenticated requests can write to the cache
- Anyone can read cached data (it's public price data)

## Next Steps

Once caching is working:
1. Monitor your API usage reduction
2. Enjoy faster chart load times!
3. Consider adding caching for other data (token stats, holder counts, etc.)

## Questions?

If you run into issues, check:
1. Supabase dashboard logs (Logs & Analytics section)
2. Browser developer console
3. Network tab to see API vs cache hits
