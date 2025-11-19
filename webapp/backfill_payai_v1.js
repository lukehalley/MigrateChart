#!/usr/bin/env node

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TOKEN_ADDRESS = 'E7NgL19JbN8BhUDgWjkH8MtnbhJoaGaWJqosxZZepump';
const PROJECT_ID = 'dbaa6f76-04d7-415e-8480-881dbcff47d6';

async function fetchJupiterData(interval, candles) {
  const url = `https://datapi.jup.ag/v2/charts/${TOKEN_ADDRESS}?interval=${interval}&to=${Date.now()}&candles=${candles}&type=price&quote=usd`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://jup.ag/',
        'Origin': 'https://jup.ag'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function insertOHLCData(records) {
  // Insert in batches to avoid conflicts
  let inserted = 0;
  for (const record of records) {
    const { error } = await supabase
      .from('ohlc_cache')
      .insert(record)
      .select();

    if (error && !error.message.includes('duplicate')) {
      console.error('Error inserting record:', error);
    } else if (!error) {
      inserted++;
    }
  }

  console.log(`  Inserted ${inserted} new records (${records.length - inserted} duplicates skipped)`);
  return inserted;
}

async function backfillData() {
  console.log('Fetching daily data from Jupiter...');
  const dailyData = await fetchJupiterData('1_DAY', 500);

  if (!dailyData.candles || dailyData.candles.length === 0) {
    console.error('No data returned from Jupiter');
    return;
  }

  console.log(`Received ${dailyData.candles.length} daily candles`);
  console.log(`Date range: ${new Date(dailyData.candles[0].time * 1000).toISOString().split('T')[0]} to ${new Date(dailyData.candles[dailyData.candles.length - 1].time * 1000).toISOString().split('T')[0]}`);

  // Insert 1D data
  const dailyRecords = dailyData.candles.map(candle => ({
    token_address: TOKEN_ADDRESS,
    project_id: PROJECT_ID,
    timeframe: '1D',
    timestamp: candle.time,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume || 0
  }));

  console.log('Inserting daily data...');
  await insertOHLCData(dailyRecords);
  console.log(`✓ Inserted ${dailyRecords.length} daily records`);

  // Also insert as MAX timeframe
  console.log('Inserting MAX timeframe data...');
  const maxRecords = dailyRecords.map(r => ({ ...r, timeframe: 'MAX' }));
  await insertOHLCData(maxRecords);
  console.log(`✓ Inserted ${maxRecords.length} MAX records`);

  // Fetch hourly data (last 1000 hours = ~41 days)
  console.log('\nFetching hourly data from Jupiter...');
  const hourlyData = await fetchJupiterData('1_HOUR', 1000);

  if (hourlyData.candles && hourlyData.candles.length > 0) {
    console.log(`Received ${hourlyData.candles.length} hourly candles`);

    const hourlyRecords = hourlyData.candles.map(candle => ({
      token_address: TOKEN_ADDRESS,
      project_id: PROJECT_ID,
      timeframe: '1H',
      timestamp: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0
    }));

    console.log('Inserting hourly data...');
    await insertOHLCData(hourlyRecords);
    console.log(`✓ Inserted ${hourlyRecords.length} hourly records`);

    // Generate 4H and 8H from hourly data
    console.log('\nGenerating 4H timeframe from hourly data...');
    const { data: aggData4H, error: error4H } = await supabase.rpc('aggregate_ohlc_4h', {
      p_token_address: TOKEN_ADDRESS,
      p_project_id: PROJECT_ID
    });

    if (error4H) {
      console.error('Error aggregating 4H:', error4H);
    } else {
      console.log(`✓ Generated 4H timeframe data`);
    }

    console.log('Generating 8H timeframe from hourly data...');
    const { data: aggData8H, error: error8H } = await supabase.rpc('aggregate_ohlc_8h', {
      p_token_address: TOKEN_ADDRESS,
      p_project_id: PROJECT_ID
    });

    if (error8H) {
      console.error('Error aggregating 8H:', error8H);
    } else {
      console.log(`✓ Generated 8H timeframe data`);
    }
  }

  console.log('\n✅ Backfill complete!');
}

backfillData().catch(console.error);
