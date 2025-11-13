-- Supabase Schema for OHLC Data Caching
-- This schema caches historical candlestick data to reduce API calls

-- Table to store OHLC (candlestick) data
CREATE TABLE IF NOT EXISTS ohlc_cache (
  id BIGSERIAL PRIMARY KEY,
  token_address TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  open DOUBLE PRECISION NOT NULL,
  high DOUBLE PRECISION NOT NULL,
  low DOUBLE PRECISION NOT NULL,
  close DOUBLE PRECISION NOT NULL,
  volume DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint to prevent duplicate entries
  UNIQUE(token_address, timeframe, timestamp)
);

-- Index for fast queries by token and timeframe
CREATE INDEX IF NOT EXISTS idx_ohlc_token_timeframe
ON ohlc_cache(token_address, timeframe);

-- Index for timestamp queries (getting data in time ranges)
CREATE INDEX IF NOT EXISTS idx_ohlc_timestamp
ON ohlc_cache(timestamp);

-- Composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_ohlc_lookup
ON ohlc_cache(token_address, timeframe, timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE ohlc_cache ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access (for cached data)
CREATE POLICY "Allow public read access"
ON ohlc_cache
FOR SELECT
USING (true);

-- Policy to allow authenticated inserts (for your API)
CREATE POLICY "Allow authenticated inserts"
ON ohlc_cache
FOR INSERT
WITH CHECK (true);

-- Policy to allow authenticated updates (for cache updates)
CREATE POLICY "Allow authenticated updates"
ON ohlc_cache
FOR UPDATE
USING (true);

-- Optional: Add a function to clean up very old cache entries if needed
-- (Usually not needed since historical data is valuable, but included for completeness)
CREATE OR REPLACE FUNCTION cleanup_old_cache(days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ohlc_cache
  WHERE created_at < NOW() - (days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
