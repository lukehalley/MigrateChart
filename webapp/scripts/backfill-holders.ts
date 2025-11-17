/**
 * Script to backfill historical holder data
 *
 * Usage:
 * 1. Edit the `historicalData` array below with your historical holder counts
 * 2. Run: npx tsx scripts/backfill-holders.ts
 *
 * Note: This requires CRON_SECRET to be set in your environment
 */

interface HistoricalSnapshot {
  projectId: string;
  tokenAddress: string;
  holderCount: number;
  timestamp: number; // Unix timestamp in seconds
}

// Helper function to create a timestamp from a date string
function dateToTimestamp(dateString: string): number {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

// ============================================================================
// CONFIGURE YOUR HISTORICAL DATA HERE
// ============================================================================

const historicalData: HistoricalSnapshot[] = [
  // Example format - replace with your actual data:
  // {
  //   projectId: '49fd8ab1-e85b-445f-9f92-defa0d46363a',
  //   tokenAddress: '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA',
  //   holderCount: 4500,
  //   timestamp: dateToTimestamp('2025-01-10T12:00:00Z'),
  // },
  // {
  //   projectId: '49fd8ab1-e85b-445f-9f92-defa0d46363a',
  //   tokenAddress: '8avjtjHAHFqp4g2RR9ALAGBpSTqKPZR8nRbzSTwZERA',
  //   holderCount: 4520,
  //   timestamp: dateToTimestamp('2025-01-11T12:00:00Z'),
  // },
];

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

async function backfillHolders() {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('❌ Error: CRON_SECRET environment variable not set');
    console.error('Please set CRON_SECRET in your .env.local file');
    process.exit(1);
  }

  if (historicalData.length === 0) {
    console.error('❌ Error: No historical data configured');
    console.error('Please edit the historicalData array in this script');
    process.exit(1);
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const endpoint = `${apiUrl}/api/admin/backfill-holders`;

  console.log('🚀 Starting backfill process...');
  console.log(`📊 Total snapshots to insert: ${historicalData.length}`);
  console.log('');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({
        snapshots: historicalData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      process.exit(1);
    }

    const result = await response.json();

    console.log('✅ Backfill completed!');
    console.log(`📈 Inserted: ${result.inserted} / ${result.total}`);
    console.log('');
    console.log('Results:');
    console.log('---');

    result.results.forEach((r: any) => {
      const date = new Date(r.timestamp * 1000).toISOString();
      const status = r.success ? '✅' : '❌';
      console.log(`${status} ${date} - ${r.success ? 'Success' : r.error}`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

backfillHolders();
