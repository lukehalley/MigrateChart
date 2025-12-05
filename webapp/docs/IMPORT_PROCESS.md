# Migration Import Process - Complete E2E Documentation

## Overview

Comprehensive automated import from migrate.fun that fetches all necessary data and creates a fully-configured project ready for admin preview.

---

## Import Flow

### Phase 1: Data Discovery (migrate.fun → On-Chain)

**Input:** `https://migrate.fun/claim/mig81`

1. **Extract Migration ID** (`mig81`)
   - Only used for on-chain account lookup
   - Never appears in final URLs or display names

2. **Fetch Migration Account** (Solana blockchain)
   - Migration start/end timestamps
   - Old token mint address
   - New token mint address
   - Exchange rate
   - Migration status

3. **Fetch Token Metadata** (Metaplex for BOTH tokens)
   - **Old Token** (e.g., "Roru Labs")
     - Name: "Roru Labs"
     - Symbol: "RORU"
     - Decimals, supply, etc.
   - **New Token** (e.g., "HereWeGo")
     - Name: "HereWeGo"
     - Symbol: "HEREWEGO"
     - Image URI (IPFS/Arweave)
     - Social links (twitter, telegram, website)

---

### Phase 2: Asset Processing

4. **Generate Project Slug**
   ```typescript
   // From token symbol: "HEREWEGO" -> "herewego"
   const slug = newToken.symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
   // Result: URLs become /herewego (NOT /mig81)
   ```

5. **Upload Logo**
   - Downloads image from IPFS/Arweave
   - Uploads to Supabase Storage (`project-logos` bucket)
   - Generates public URL
   - Also used as loader SVG (can be customized later)
   - Fallback: Uses original IPFS URL if upload fails

6. **Discover Pool Address** (🚨 CRITICAL)
   - Uses DexScreener API to find actual liquidity pools
   - Filters for Raydium, Meteora, Orca (in that order of preference)
   - Sorts by liquidity (USD value)
   - Returns actual pool address (NOT token address)
   - **Why Critical:** Charts need the pool address, not token address!

   **Example:**
   ```
   Token Address: 7rWY...pump
   Pool Address:  8xQz...7N7Di (discovered Raydium pool)
   ```

7. **Fetch Global Config**
   - Donation address from `site_config` table
   - Other site-wide settings

---

### Phase 3: Database Creation

8. **Create Project Record**
   ```sql
   INSERT INTO projects (
     name,              -- "HereWeGo" (from metadata)
     slug,              -- "herewego" (from symbol)
     logo_url,          -- Supabase Storage URL
     loader_url,        -- Same as logo_url
     donation_address,  -- Global config
     primary_color,     -- Default: #8C5CFF (purple)
     secondary_color,   -- Default: #000000 (black)
     migrate_fun_id,    -- "mig81" (stored for reference)
     migrate_fun_url,   -- Original URL
     is_active,         -- false (starts inactive)
     enabled,           -- true (enabled but not public)
     burns_enabled      -- false (disabled by default)
   )
   ```

9. **Create Pool Records**
   ```sql
   -- Pool 1: Old Token (Legacy)
   INSERT INTO pools (
     pool_name:    "Roru Labs (Legacy)",
     token_symbol: "RORU",
     token_address: doGh...QHWz,
     pool_address:  doGh...QHWz,    -- Token address (pump.fun)
     dex_type:     "unknown",
     fee_rate:     0,
     order_index:  0
   )

   -- Pool 2: New Token (Current)
   INSERT INTO pools (
     pool_name:    "HereWeGo",
     token_symbol: "HEREWEGO",
     token_address: 7rWY...pump,
     pool_address:  8xQz...7N7Di,   -- 🎯 DISCOVERED POOL (not token!)
     dex_type:     "raydium",       -- Discovered from DexScreener
     fee_rate:     0.008,           -- 0.8% (typical Raydium)
     order_index:  1
   )
   ```

10. **Create Migration Record**
    ```sql
    INSERT INTO migrations (
      label:    "RORU<br/>-><br/>HEREWEGO",
      migration_timestamp: <end_date>,
      from_pool_id: <legacy_pool_id>,
      to_pool_id:   <new_pool_id>
    )
    ```

---

### Phase 4: Initial Data Collection

11. **Fetch Holder Count**
    - **Primary Source:** DexScreener API (`pairs[0].info.holders`)
    - **Fallback:** Helius RPC (`getTokenLargestAccounts`)
    - Saves initial snapshot to `holder_snapshots` table

12. **Save Holder Snapshot**
    ```sql
    INSERT INTO holder_snapshots (
      project_id,
      token_address,
      holder_count,
      timestamp
    )
    ```

---

## Data Completeness After Import

| Data Type | Status | Source | Notes |
|-----------|--------|--------|-------|
| ✅ Token Metadata | Complete | Metaplex | Names, symbols, decimals |
| ✅ Pool Address | Complete | DexScreener | Actual Raydium/Meteora pool |
| ✅ Logo | Complete | IPFS → Supabase | Uploaded to Storage |
| ✅ Loader SVG | Complete | Same as logo | Can be customized |
| ✅ Donation Address | Complete | site_config | Global setting |
| ✅ Migration Timeline | Complete | migrate.fun | Start/end dates |
| ✅ Initial Holders | Complete | DexScreener/Helius | Current holder count |
| ⚠️ Historical Candlesticks | Missing | Backfill Required | Run after import |
| ⚠️ Historical Holders | Missing | Backfill Required | Run after import |
| ❌ Burns | Disabled | N/A | Can be enabled if needed |

---

## Post-Import Steps

### Required Backfills

After import completes, admin must run these backfill jobs:

1. **Backfill Candlestick Data**
   ```
   POST /api/admin/backfill-candlesticks
   Body: { projectId: "<id>", poolId: "<new_pool_id>" }
   ```
   - Fetches historical OHLCV data from Jupiter/GeckoTerminal
   - Required for charts to display properly

2. **Backfill Historical Holders**
   ```
   POST /api/admin/backfill-holders
   Body: { projectId: "<id>", tokenAddress: "<address>", days: 90 }
   ```
   - Fetches historical holder snapshots
   - Required for holder tracking graphs

3. **Enable Project**
   - Click the activate button in admin dashboard
   - Or set `is_active = true` in database
   - Project becomes publicly visible

### Optional Steps

4. **Customize Colors**
   - Update `primary_color` (default: #8C5CFF)
   - Update `secondary_color` (default: #000000)

5. **Upload Custom Loader SVG**
   - Replace auto-generated loader with custom design
   - Upload to `project-logos` bucket as `{slug}-loader.svg`

6. **Enable Burns Tracking** (if applicable)
   - Set `burns_enabled = true`
   - Run burns backfill job

---

## Naming Strategy

### Migration ID Usage

**During Import Only:**
- Migration ID (e.g., `mig81`) used to:
  - Find on-chain migration account
  - Fetch migration data
  - Store in `migrate_fun_id` field for reference

**After Import:**
- Slug: `herewego` (from token symbol)
- Name: "HereWeGo" (from token metadata)
- URLs: `/herewego` or `/preview/herewego`
- Display: "HereWeGo" everywhere
- **migXXX never appears to users**

### Token Naming

| Source | Old Token | New Token |
|--------|-----------|-----------|
| **Migration ID** | mig81 (on-chain only) | mig81 (on-chain only) |
| **Metaplex Name** | Roru Labs | HereWeGo |
| **Metaplex Symbol** | RORU | HEREWEGO |
| **Final Display** | Roru Labs (Legacy) | HereWeGo |
| **Final Slug** | N/A | herewego |

---

## API Response Format

```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "slug": "herewego",
    "name": "HereWeGo",
    "logo_url": "https://...supabase.co/.../herewego.png",
    "donation_address": "G9fX...apb"
  },
  "pools": [
    {
      "id": "uuid",
      "name": "Roru Labs (Legacy)",
      "symbol": "RORU",
      "pool_address": "doGh...QHWz",
      "dex_type": "unknown"
    },
    {
      "id": "uuid",
      "name": "HereWeGo",
      "symbol": "HEREWEGO",
      "pool_address": "8xQz...7N7Di",  // 🎯 Discovered pool!
      "dex_type": "raydium"
    }
  ],
  "migration": {
    "id": "uuid",
    "label": "RORU<br/>-><br/>HEREWEGO"
  },
  "dataFetched": {
    "tokenMetadata": true,
    "poolAddress": true,
    "logo": true,
    "holders": true,
    "holderCount": 1234,
    "burns": false
  },
  "warnings": []
}
```

---

## Error Handling

### Pool Discovery Failures

If DexScreener can't find a pool:
- Falls back to using token address
- Returns warning in response
- Charts may not work properly
- Admin should manually update pool address

### Logo Upload Failures

If IPFS download or Supabase upload fails:
- Uses original IPFS URL as fallback
- Marks `logo: false` in response
- Project still imports successfully
- Admin can manually upload later

### Holder Count Failures

If both DexScreener and Helius fail:
- Continues with `holderCount: 0`
- Marks `holders: false` in response
- Admin can run holder backfill after import

---

## Comparison: Import vs ZERA (Golden Standard)

| Feature | ZERA | Import (HereWeGo) | Notes |
|---------|------|-------------------|-------|
| Pools | 3 pools | 2 pools | ZERA has additional Meteora pool |
| Pool Addresses | ✅ Correct | ✅ Discovered | Used DexScreener |
| Token Names | ✅ Custom | ✅ From Metaplex | On-chain metadata |
| Logo | ✅ Custom AVIF | ✅ Auto-uploaded | From token metadata |
| Holders | 495 snapshots | 1 initial snapshot | Backfill needed |
| Burns | ✅ Enabled | ❌ Disabled | Can enable later |
| Donation | ✅ Global | ✅ Global | From site_config |
| Candlesticks | ✅ Complete history | ⚠️ Need backfill | Post-import job |

---

## Success Criteria

✅ **Import Successful** when:
- Project created with proper slug (not migXXX)
- Both pools created with correct addresses
- Migration record created
- Logo uploaded to Supabase
- Initial holder snapshot saved
- `dataFetched.poolAddress === true`

⚠️ **Needs Attention** when:
- `warnings` array contains items
- `dataFetched.poolAddress === false` (charts won't work)
- `dataFetched.logo === false` (logo missing)
- `holderCount === 0` (no holder data)

❌ **Import Failed** when:
- 409 Conflict: Project already exists
- 404 Not Found: Migration doesn't exist on migrate.fun
- 500 Error: Database or API failure (check logs)

---

## Future Enhancements

1. **Multi-Pool Discovery**
   - Discover multiple pools (Raydium + Meteora)
   - Allow admin to select which pools to track

2. **Historical Data Backfill During Import**
   - Option to fetch historical candlesticks immediately
   - Option to fetch historical holders immediately
   - Trade-off: Import takes longer vs immediate data availability

3. **Automatic Activation**
   - Option to auto-activate after successful backfills
   - Require admin approval for safety

4. **Migration Verification**
   - Verify migration is complete before import
   - Check for sufficient liquidity in new pool
   - Validate token supply matches expectations

---

## Admin Dashboard Integration

After import, admin can:
1. **Preview** at `/preview/herewego` (shows PREVIEW MODE banner)
2. **Check Data Status** in projects table (Chart, Holders, Burns indicators)
3. **Run Backfills** to populate historical data
4. **Activate** when ready to make public

---

## Developer Notes

### Why Separate Pool Discovery?

Using token address as pool address breaks charts because:
- Jupiter API expects actual pool addresses
- GeckoTerminal expects actual pool addresses
- Pool address != Token address (except for pump.fun)

### Why Upload Logos?

- IPFS can be slow or unreliable
- Supabase Storage is fast and reliable
- Allows for custom logo replacements
- Better control over image formats

### Why Initial Holder Snapshot?

- Provides immediate data for holder view
- Shows project has real users
- Establishes baseline for growth tracking
