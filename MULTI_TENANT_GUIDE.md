# Multi-Tenant Token Migration Chart Platform

## Overview

This platform has been transformed into a white-label SaaS solution where multiple token projects can track their complete price history across pool migrations. Each project gets:

- **Custom branding** (logo, primary color, loading animation)
- **Dynamic migration tracking** (supports unlimited migrations)
- **Dedicated donation tracking** (collects donations in project's native token)
- **Automatic theming** (all UI colors adapt to project's primary color)

---

## Architecture

### Database Schema

**`projects`** - Master configuration for each token
- `slug` - URL identifier (e.g., 'zera', 'tokenx')
- `name` - Display name
- `primary_color` - Hex color (#52C97D)
- `logo_url` - Supabase Storage URL
- `loader_svg` - SVG markup for loading animation
- `donation_address` - Solana wallet for donations
- `is_default` - Default project to load
- `is_active` - Soft delete flag

**`pools`** - Pool/contract definitions per project
- `project_id` - Foreign key to projects
- `pool_address` - Solana pool address
- `token_address` - Token mint address
- `token_symbol` - Display symbol (e.g., 'ZERA', 'M0N3Y')
- `pool_name` - Descriptive name
- `dex_type` - DEX platform (raydium, meteora, pump_fun, etc.)
- `order_index` - Sequence in migration chain (0, 1, 2...)

**`migrations`** - Migration events connecting pools
- `project_id` - Foreign key to projects
- `from_pool_id` - Source pool
- `to_pool_id` - Destination pool
- `migration_timestamp` - Unix timestamp (seconds)
- `label` - Display label (supports HTML: `TOKEN1<br/>-><br/>TOKEN2`)

---

## Adding a New Project

### Step 1: Prepare Assets

1. **Logo Image**: Any format (PNG, AVIF, WEBP recommended)
   - Upload to Supabase Storage → `project-logos` bucket
   - Get public URL: `https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/yourlogo.avif`

2. **Loader SVG**: Extract from component or create new
   - Must be valid SVG markup
   - Will be colored dynamically with `currentColor`
   - Example from ZERA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82 83"><path d="..." fill="currentColor"/></svg>`

3. **Primary Color**: Hex format (e.g., `#FF5733`)

### Step 2: Insert into Supabase

```sql
-- 1. Insert project
INSERT INTO projects (slug, name, primary_color, logo_url, loader_svg, donation_address, is_default, is_active)
VALUES (
  'tokenx',                          -- URL slug
  'TokenX',                          -- Display name
  '#FF5733',                         -- Primary color
  'https://...supabase.co/storage/.../tokenx.png',  -- Logo URL
  '<svg>...</svg>',                  -- Loader SVG
  'YourSolanaWalletAddress',         -- Donation address
  false,                             -- Not default (only one can be default)
  true                               -- Active
);

-- 2. Get the project ID (note it down)
SELECT id FROM projects WHERE slug = 'tokenx';

-- 3. Insert pools (minimum 2 for migration)
INSERT INTO pools (project_id, pool_address, token_address, token_symbol, pool_name, dex_type, order_index)
VALUES
  (
    'PROJECT_ID_FROM_STEP_2',
    'OriginalPoolAddress',
    'OriginalTokenMint',
    'TOKEN1',
    'TokenX Original',
    'raydium',
    0                                 -- First pool
  ),
  (
    'PROJECT_ID_FROM_STEP_2',
    'NewPoolAddress',
    'NewTokenMint',                   -- Can be same as original if same token
    'TOKEN2',
    'TokenX Meteora',
    'meteora',
    1                                 -- Second pool
  );

-- 4. Get pool IDs (note them down)
SELECT id, pool_name, order_index FROM pools WHERE project_id = 'PROJECT_ID' ORDER BY order_index;

-- 5. Insert migration
INSERT INTO migrations (project_id, from_pool_id, to_pool_id, migration_timestamp, label)
VALUES (
  'PROJECT_ID',
  'POOL_0_ID',                       -- From first pool
  'POOL_1_ID',                       -- To second pool
  1234567890,                        -- Unix timestamp of migration
  'TOKEN1<br/>-><br/>TOKEN2'         -- Label (supports HTML)
);
```

### Step 3: Test

1. Refresh app
2. Access at `/?token=tokenx`
3. If multiple projects exist, dropdown appears for switching

---

## URL Structure

- `/` - Loads default project (ZERA)
- `/?token=tokenx` - Loads specific project
- `/?token=tokenx&timeframe=1H` - With timeframe

---

## Features Supported

### ✅ Unlimited Migrations
- Each pool is automatically filtered by its migration boundaries
- Migration lines drawn dynamically on chart
- Pool journey display adapts to any number of migrations

### ✅ Dynamic Theming
- All colors use CSS variables
- Primary color automatically generates variants (darker, lighter, with opacity)
- UI buttons, borders, shadows, text all adapt

### ✅ Token-Specific Donations
- Tracks donations in project's native token
- Shows both token balance and SOL balance
- Auto-scales goals when met

### ✅ Smart Data Caching
- All cache tables are multi-tenant (include `project_id`)
- Deduplicates API calls
- Graceful fallback if cache unavailable

---

## Current Projects

### ZERA (Default)
- **Slug**: `zera`
- **Color**: `#52C97D` (green)
- **Migrations**: 2 (M0N3Y → Raydium → Meteora)
- **Logo**: `https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/zera.avif`

---

## Technical Details

### API Endpoints
- `GET /api/projects` - List all active projects
- `GET /api/projects/[slug]` - Get full project config
- `GET /api/token-balance?address=X&mint=Y` - Get SPL token balance
- `GET /api/wallet-balance?address=X` - Get SOL balance

### Key Components
- `TokenContext` - Manages current project state
- `TokenSwitcher` - Dropdown for switching projects
- `TokenLoadingLogo` - Dynamic loading animation
- `useTheme` - Generates CSS variables from primary color

### Data Flow
1. User visits `/` or `/?token=slug`
2. `TokenContext` fetches project config from API
3. `useTheme` generates CSS variables
4. All components receive project config and adapt
5. Chart fetches data filtered by project's migrations

---

## Logo Storage Best Practices

### Recommended Approach: Supabase Storage
- **Bucket**: `project-logos` (public)
- **Format**: AVIF (smallest), PNG, or WEBP
- **Size**: Under 100KB recommended
- **Dimensions**: Square (e.g., 512x512 or 256x256)

### URL Format
```
https://uxdhkdmneyskpkmcbjny.supabase.co/storage/v1/object/public/project-logos/{filename}
```

---

## Revenue Model

The more diverse tokens you add:
- **Token A holders** → donate Token A
- **Token B holders** → donate Token B
- **Token C holders** → donate Token C

You accumulate a portfolio of community tokens, each with potential upside!

---

## Support

For questions or issues, contact the maintainer or check the codebase documentation.
