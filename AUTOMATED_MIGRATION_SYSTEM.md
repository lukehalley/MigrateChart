# Automated Token Migration System

## Overview

This document describes the system for **automatically** adding tokens from migrate.fun to the chart platform without manual intervention.

## Current Manual Process (How PAYAI Was Added)

### 1. Asset Preparation
```bash
# Upload logo to Supabase Storage
# Upload loader SVG to Supabase Storage
# Choose primary and secondary colors
```

### 2. Database Setup
```sql
-- Insert project record
INSERT INTO projects (slug, name, primary_color, "secondaryColor", logo_url, loader_url, donation_address)
VALUES ('payai', 'PayAI', '#6F8AE9', '#FFFFFF', 'https://...', 'https://...', 'PAYmo...');

-- Insert pool records (V1 and V2)
INSERT INTO pools (project_id, pool_address, token_address, token_symbol, pool_name, dex_type, order_index)
VALUES
  ('{project_id}', 'AQcBbrw...', 'E7NgL19...', 'PAYAI', 'PayAI V1', 'Raydium', 0),
  ('{project_id}', 'CP8fLux...', 'PAYmo6m...', 'PAYAI', 'PayAI V2', 'Raydium', 1);

-- Insert migration record
INSERT INTO migrations (project_id, from_pool_id, to_pool_id, migration_timestamp, label)
VALUES ('{project_id}', '{v1_id}', '{v2_id}', 1762279200, 'Token V2 Migration');
```

### 3. Data Backfill
```bash
# Run backfill script to populate OHLC data from Jupiter API
node backfill_payai_v1.js
```

---

## Proposed Automated System

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cron Job (Daily)                         │
│                                                              │
│  1. Fetch active migrations from migrate.fun               │
│  2. Check which tokens exist in our database                │
│  3. For new tokens:                                         │
│     a. Fetch token metadata (name, logo from IPFS)         │
│     b. Generate slug and colors                             │
│     c. Create project + pools + migration records          │
│     d. Backfill historical OHLC data                        │
│  4. For existing tokens:                                    │
│     a. Check if migration status changed                    │
│     b. Update end dates if needed                           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
migrate.fun API ──> Migration Data ──> Our DB
     │                                     │
     ├─> Old Token Mint ──────────────────┤
     ├─> New Token Mint ──────────────────┤
     ├─> Start Date ──────────────────────┤
     ├─> End Date ────────────────────────┤
     └─> Migration ID ────────────────────┘
```

---

## Implementation Components

### 1. Migration Sync Service

**File**: `webapp/lib/services/migrationSyncService.ts`

```typescript
interface MigrationSyncResult {
  added: string[];      // New projects added
  updated: string[];    // Existing projects updated
  skipped: string[];    // Already synced
  errors: string[];     // Failed operations
}

class MigrationSyncService {
  /**
   * Main sync function - run this daily
   */
  async syncActiveMigrations(): Promise<MigrationSyncResult>

  /**
   * Process a single migration from migrate.fun
   */
  private async processM igration(migration: MigrationProject): Promise<void>

  /**
   * Check if migration already exists in our DB
   */
  private async migrationExists(oldTokenMint: string, newTokenMint: string): Promise<boolean>

  /**
   * Create complete project setup
   */
  private async createProject(migration: MigrationProject): Promise<void>

  /**
   * Fetch token metadata from Solana/Jupiter
   */
  private async fetchTokenMetadata(tokenMint: string): Promise<TokenMetadata>

  /**
   * Download logo from IPFS and upload to Supabase Storage
   */
  private async syncTokenLogo(ipfsHash: string, tokenMint: string): Promise<string>

  /**
   * Generate color palette from logo image
   */
  private async generateColors(logoUrl: string): Promise<{ primary: string, secondary: string }>

  /**
   * Backfill OHLC data from Jupiter for both tokens
   */
  private async backfillOHLCData(tokenMint: string, projectId: string): Promise<void>
}
```

### 2. Asset Management

**Challenges**:
- Logos are stored on IPFS (need to fetch and re-upload to Supabase)
- No loader SVGs available (need to generate or use default)
- Colors need to be extracted from logo or defaulted

**Solutions**:
```typescript
// Download from IPFS
const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
const imageBuffer = await fetch(ipfsUrl).then(r => r.arrayBuffer());

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('project-logos')
  .upload(`${tokenMint}.png`, imageBuffer);

// Get public URL
const logoUrl = supabase.storage
  .from('project-logos')
  .getPublicUrl(`${tokenMint}.png`).data.publicUrl;

// Extract colors using color-thief or vibrant
import ColorThief from 'color-thief';
const colorThief = new ColorThief();
const palette = await colorThief.getPalette(imageUrl, 2);
const primaryColor = rgbToHex(palette[0]);
const secondaryColor = rgbToHex(palette[1]);
```

### 3. Data Backfill Automation

**Challenge**: Need to backfill OHLC data for **both** old and new token mints.

**Solution**:
```typescript
async function backfillTokenData(
  tokenMint: string,
  projectId: string,
  poolId: string
): Promise<void> {
  // Fetch from Jupiter API
  const intervals = ['1_HOUR', '1_DAY'];

  for (const interval of intervals) {
    const candles = await fetchJupiterCandles(tokenMint, interval);

    // Insert into ohlc_cache
    const records = candles.map(candle => ({
      token_address: tokenMint,
      project_id: projectId,
      timeframe: interval === '1_HOUR' ? '1H' : '1D',
      timestamp: candle.time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0
    }));

    await supabase.from('ohlc_cache').insert(records);
  }
}
```

### 4. Project Creation Logic

```typescript
async function createProjectFromMigration(migration: MigrationProject): Promise<void> {
  // 1. Fetch metadata for both tokens
  const oldTokenMeta = await fetchTokenMetadata(migration.oldTokenMint);
  const newTokenMeta = await fetchTokenMetadata(migration.newTokenMint);

  // 2. Download and sync logos
  const oldLogoUrl = await syncTokenLogo(oldTokenMeta.ipfsHash, migration.oldTokenMint);
  const newLogoUrl = await syncTokenLogo(newTokenMeta.ipfsHash, migration.newTokenMint);

  // 3. Generate colors from logo
  const colors = await generateColors(newLogoUrl); // Use new token's logo

  // 4. Create slug from project name
  const slug = migration.projectName
    .toLowerCase()
    .replace(/\s+migration.*$/i, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);

  // 5. Insert project
  const { data: project } = await supabase
    .from('projects')
    .insert({
      slug,
      name: migration.projectName.replace(/\s+Migration.*$/i, ''),
      primary_color: colors.primary,
      secondaryColor: colors.secondary,
      logo_url: newLogoUrl,
      loader_url: null, // Use default loader
      donation_address: migration.newTokenMint, // Use new token mint
      is_default: false,
      is_active: true
    })
    .select()
    .single();

  // 6. Insert old pool
  const { data: oldPool } = await supabase
    .from('pools')
    .insert({
      project_id: project.id,
      pool_address: await findPoolAddress(migration.oldTokenMint),
      token_address: migration.oldTokenMint,
      token_symbol: oldTokenMeta.symbol,
      pool_name: `${oldTokenMeta.symbol} (Original)`,
      dex_type: 'raydium', // Default or detect
      order_index: 0,
      fee_rate: 0.008
    })
    .select()
    .single();

  // 7. Insert new pool
  const { data: newPool } = await supabase
    .from('pools')
    .insert({
      project_id: project.id,
      pool_address: await findPoolAddress(migration.newTokenMint),
      token_address: migration.newTokenMint,
      token_symbol: newTokenMeta.symbol,
      pool_name: `${newTokenMeta.symbol} (V2)`,
      dex_type: 'raydium',
      order_index: 1,
      fee_rate: 0.008
    })
    .select()
    .single();

  // 8. Insert migration
  await supabase
    .from('migrations')
    .insert({
      project_id: project.id,
      from_pool_id: oldPool.id,
      to_pool_id: newPool.id,
      migration_timestamp: new Date(migration.startDate).getTime() / 1000,
      label: `${oldTokenMeta.symbol}<br/>-><br/>${newTokenMeta.symbol}`
    });

  // 9. Backfill OHLC data for both tokens
  await backfillTokenData(migration.oldTokenMint, project.id, oldPool.id);
  await backfillTokenData(migration.newTokenMint, project.id, newPool.id);
}
```

---

## Challenges & Solutions

### Challenge 1: Missing Pool Addresses
**Problem**: Migrate.fun gives us token mints, but we need pool addresses for Raydium/Meteora.

**Solutions**:
1. Query Jupiter API: `/v1/quote` endpoint can reveal pool addresses
2. Query Raydium API directly: `https://api.raydium.io/v2/main/pools`
3. Use Solana RPC to find associated token accounts
4. Fallback: Store token_address as pool_address (works for most DEXes)

### Challenge 2: No Loader SVGs
**Problem**: migrate.fun doesn't provide animated loader SVGs.

**Solutions**:
1. Use a default generic loader (spinning token icon)
2. Generate simple SVG from first letter of token name
3. Lazy load: Add loaders manually later for popular tokens

### Challenge 3: Color Extraction
**Problem**: Need to extract colors from logo images.

**Solutions**:
1. Use `color-thief-node` or `vibrant` library
2. Fallback to default color palette
3. Manual override for important tokens

### Challenge 4: Duplicate Detection
**Problem**: How to detect if a migration is already in our DB?

**Solution**:
```typescript
// Check by token mints (most reliable)
const exists = await supabase
  .from('pools')
  .select('id')
  .in('token_address', [oldTokenMint, newTokenMint])
  .limit(1);

return exists.data.length > 0;
```

### Challenge 5: Rate Limiting
**Problem**: Jupiter API has rate limits.

**Solutions**:
1. Add delays between requests (1-2 seconds)
2. Implement exponential backoff
3. Cache failed requests and retry later
4. Use multiple API keys if available

---

## Cron Job Setup

### Option 1: Vercel Cron (Recommended)
```typescript
// app/api/sync-migrations/route.ts
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const syncService = new MigrationSyncService();
  const result = await syncService.syncActiveMigrations();

  return Response.json(result);
}
```

```json
// vercel.json
{
  "crons": [{
    "path": "/api/sync-migrations",
    "schedule": "0 0 * * *"  // Daily at midnight
  }]
}
```

### Option 2: GitHub Actions
```yaml
# .github/workflows/sync-migrations.yml
name: Sync Migrations
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run sync-migrations
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('MigrationSyncService', () => {
  it('should detect new migrations', async () => {
    const service = new MigrationSyncService();
    const result = await service.syncActiveMigrations();
    expect(result.added.length).toBeGreaterThan(0);
  });

  it('should skip existing migrations', async () => {
    const service = new MigrationSyncService();
    await service.syncActiveMigrations(); // First run
    const result = await service.syncActiveMigrations(); // Second run
    expect(result.skipped.length).toBeGreaterThan(0);
  });
});
```

### Manual Testing
```bash
# Test migration sync
npm run sync-migrations

# Test single migration
npm run add-migration -- --migrationId=mig77

# Dry run (no DB writes)
npm run sync-migrations -- --dry-run
```

---

## Monitoring & Alerts

### Logging
```typescript
// Log to Supabase or external service
await supabase.from('sync_logs').insert({
  timestamp: new Date().toISOString(),
  operation: 'sync_migrations',
  result: JSON.stringify(result),
  errors: result.errors.length,
  added: result.added.length
});
```

### Alerts
- Email notification when new migrations are added
- Slack webhook for sync failures
- Dashboard showing sync status

---

## Rollout Plan

### Phase 1: Manual Mode (Current)
- Keep adding tokens manually
- Build and test automation components

### Phase 2: Semi-Automated
- Run sync script manually when needed
- Review changes before committing
- Gradually build confidence

### Phase 3: Fully Automated
- Enable daily cron job
- Auto-approve for known/trusted migrations
- Manual review for edge cases

---

## Next Steps

1. ✅ Understand current manual process (DONE)
2. ⏳ Build MigrationSyncService class
3. ⏳ Implement asset management (logos, colors)
4. ⏳ Create backfill automation
5. ⏳ Add cron job endpoint
6. ⏳ Test with current active migrations
7. ⏳ Deploy and monitor

---

## References

- Manual Setup Guide: `MULTI_TENANT_GUIDE.md`
- Migrate.fun API: `webapp/lib/migrateFunApi.ts`
- Backfill Example: `webapp/backfill_payai_v1.js`
- Database Schema: See Supabase dashboard
