# Migrate.fun Integration

This document describes the integration with migrate.fun's token migration platform to display migration status for tokens.

## Overview

Migrate.fun is a Solana-based token migration platform. This integration allows us to:
- Detect if a token has an active migration
- Show migration status (Active, Claims, Upcoming)
- Display migration dates and progress
- Link users to the migration page

## Data Source

All migration data is stored on-chain in Solana program accounts under program ID:
```
migK824DsBMp2eZXdhSBAWFS6PbvA6UN8DV15HfmstR
```

Data is fetched via migrate.fun's RPC proxy endpoint:
```
https://migrate.fun/api/rpc?cluster=mainnet
```

## API Client

The `MigrateFunAPI` class in `webapp/lib/migrateFunApi.ts` provides methods to:

### Fetch All Projects
```typescript
const api = new MigrateFunAPI();
const projects = await api.fetchAllProjects();
```

### Get Active Migrations
```typescript
const active = await api.fetchActiveProjects();
```

### Get Recent Claims (Last 30 Days)
```typescript
const recentClaims = await api.fetchRecentClaims(30);
```

### Search by Token Name
```typescript
const results = await api.searchProjects('PAYAI');
```

### Get Statistics
```typescript
const stats = await api.getStats();
// { total: 79, active: 2, claims: 77, upcoming: 0 }
```

## Data Structure

Each migration project contains:

```typescript
interface MigrationProject {
  index: number;              // Sequential index
  pubkey: string;             // Solana account address
  migrationId: string;        // e.g., "mig77"
  projectName: string;        // e.g., "MEMEVERSE Migration"
  oldTokenMint: string | null;// Old token mint address
  newTokenMint: string | null;// New token mint address
  startDate: string | null;   // ISO 8601 datetime
  endDate: string | null;     // ISO 8601 datetime
  status: 'Active' | 'Claims' | 'Upcoming' | 'Unknown';
  tokensMigrated: string | null;    // Currently not parsed
  totalSupply: string | null;       // Currently not parsed
  percentMigrated: string | null;   // Currently not parsed
}
```

## Current Active Migrations (as of Nov 2025)

1. **MEMEVERSE Migration** (mig77)
   - Old Token: `25a11Sn2bfV1qLJJvhbq8KXiCv1j1EZ6bBPCnEYrFRQz`
   - New Token: `5umdEnYVe9c7YsGWzBAW1xbBGYDF6BwW8qruFmmPbonk`
   - Period: Nov 4 - Dec 4, 2025
   - URL: https://migrate.fun/migrate/mig77

2. **BAOBAO Migration** (mig76)
   - Old Token: `BqykGfvujSYW4vWZjvKHKPeJdArv69cSRaQdAL216ne8`
   - New Token: `4bXCaDUciWA5Qj1zmcZ9ryJsoqv4rahKD4r8zYYsbonk`
   - Period: Nov 4 - Nov 25, 2025
   - URL: https://migrate.fun/migrate/mig76

## Implementation Notes

### On-Chain Data Parsing

The migration account data is stored as a packed binary structure:

```
Offset | Type      | Description
-------|-----------|------------------
0-11   | [u8; 8]   | Discriminator
12-15  | u32       | Migration ID length
16-N   | String    | Migration ID
N+4    | u32       | Project name length
N+8    | String    | Project name
...    | [u8; 32]  | Old token mint
...    | [u8; 32]  | New token mint
...    | i64       | Start timestamp
...    | i64       | End timestamp
```

### Status Determination

Status is determined by comparing current time with start/end dates:

- **Upcoming**: Current time < Start date
- **Active**: Start date ≤ Current time ≤ End date
- **Claims**: Current time > End date
- **Unknown**: Missing date information

### Caching Considerations

Migration data is relatively static (changes ~daily), so consider:
- Cache duration: 1 hour recommended
- Invalidate on user request
- Store in localStorage for instant loading

### Token Amount Parsing

The current implementation does **NOT** parse token amounts (`tokensMigrated`, `totalSupply`) from on-chain data.

To get real-time migration progress, you would need to:
1. Query the migration program's associated token accounts
2. Call `getTokenAccountBalance` RPC for each token account
3. Calculate percentage based on old token balance vs total supply

## Usage Example

```typescript
import { migrateFunApi } from '@/lib/migrateFunApi';

// Check if a specific token has an active migration
async function checkMigration(tokenMint: string) {
  const projects = await migrateFunApi.fetchActiveProjects();

  const migration = projects.find(
    p => p.oldTokenMint === tokenMint || p.newTokenMint === tokenMint
  );

  if (migration) {
    console.log(`Active migration found: ${migration.projectName}`);
    console.log(`Visit: https://migrate.fun/migrate/${migration.migrationId}`);
  }
}

// Display migration banner
async function showMigrationBanner() {
  const stats = await migrateFunApi.getStats();

  if (stats.active > 0) {
    const active = await migrateFunApi.fetchActiveProjects();
    // Show banner for each active migration
  }
}
```

## Future Enhancements

1. **Token Amount Tracking**
   - Parse token account balances
   - Calculate real-time migration progress
   - Display "Tokens Migrated" counter

2. **Migration Notifications**
   - Alert users when their token has a new migration
   - Show countdown timer for migration end date
   - Push notifications for claim periods

3. **Historical Data**
   - Store migration history in database
   - Show past migrations for a token
   - Analytics on migration success rates

4. **Integration with Chart**
   - Show migration event markers on price chart
   - Display before/after token performance
   - Annotate significant migration dates

## Testing

```bash
# Test the API client
cd webapp
npx ts-node -e "
import { MigrateFunAPI } from './lib/migrateFunApi';
const api = new MigrateFunAPI();
api.fetchAllProjects().then(p => console.log('Found', p.length, 'migrations'));
"
```

## References

- Website: https://migrate.fun
- Program ID: `migK824DsBMp2eZXdhSBAWFS6PbvA6UN8DV15HfmstR`
- RPC Endpoint: `https://migrate.fun/api/rpc?cluster=mainnet`
