# Migrate Chart - Site Map

## Overview
Complete navigation structure for migrate-chart.fun, a platform that provides unified price history tracking for Solana tokens across pool migrations.

---

## Public Routes

### Landing & Marketing

#### `/` - Home / Landing Page
**Purpose:** Marketing landing page showcasing the platform's value proposition
**Component:** `LandingPageNew.tsx`
**Features:**
- Hero section with animated candlestick background
- Terminal-style design with green theme
- Three feature cards (Unified Timeline, Pre-Migration Data, Migration Markers)
- Live projects showcase
- CTA section for token listing
- Footer with navigation links

**Key Actions:**
- "See An Example" → `/zera`
- "Add Your Token" → `/contact`

---

### Token Pages (Dynamic Routes)

#### `/:token` - Token Dashboard
**Purpose:** Main application - interactive price charts across all pool migrations
**Component:** `app/[token]/page.tsx`
**Authentication:** Public (preview mode requires auth)
**Features:**
- TradingView-style candlestick charts
- Multiple timeframes: 1H, 4H, 8H, 1D, MAX
- Four view modes: Chart, Fees, Holders, Burns
- Token statistics sidebar (collapsible on desktop)
- Donation tracking with progress bars
- Pool migration visualization
- Drawing tools (horizontal lines, trend lines, freehand)
- Token switcher for multi-project navigation

**Dynamic Theming:** Each project has custom primary/secondary colors

**Desktop Layout (≥1024px):**
```
┌─────────────────────────────────────────────┐
│ Donation Banner (with copy address + goals) │
├─────────────────────────────┬───────────────┤
│                             │   Sidebar     │
│   Chart / Fees / Holders    │   (250px)     │
│   / Burns View              │   - Logo      │
│   (Responsive)              │   - Stats     │
│                             │   - Controls  │
└─────────────────────────────┴───────────────┘
```

**Mobile Layout (<1024px):**
```
┌──────────────────────────┐
│  Donation Banner         │
├──────────────────────────┤
│  Chart / Fees / Holders  │
│  / Burns View            │
│  (Full Width)            │
│                          │
│  [Menu Button] →         │
│    Opens Popup Menu      │
└──────────────────────────┘
```

#### `/:token/fees` - Fees Analytics Detail
**Purpose:** Detailed fee collection analytics and charts
**Component:** `app/[token]/fees/page.tsx`
**Authentication:** Public
**Features:**
- Total fees collected (large hero stat)
- Average daily fees
- Peak day tracking
- Days active counter
- Daily fees bar chart
- Cumulative fees area chart
- Timeframe selector: 7D, 30D, 90D, ALL

#### `/preview/:token` - Preview Mode (Admin Only)
**Purpose:** Preview unpublished projects before making them live
**Component:** `app/preview/[token]/page.tsx`
**Authentication:** Required (admin)
**Features:**
- Identical to `/:token` dashboard
- "PREVIEW MODE" amber banner at top
- Redirects to login if not authenticated

---

### Contact & Listings

#### `/contact` - Add Your Token
**Purpose:** Project teams request their migrated token be listed
**Component:** `app/contact/page.tsx`
**Authentication:** None required
**Features:**
- Contact info form (name, email, telegram)
- Migration details form (project name, old/new token addresses, migrate.fun URL)
- Success state with confirmation message
- Auto-redirect to home after submission

**Form Fields:**
- Name, Email, Telegram Handle
- Project Name
- Pre-Migration Token Address
- Current Token Address
- Migrate.Fun Link (optional)
- Additional Notes (optional)

**API:** `POST /api/inquiries`

---

## Admin Routes

**Base Route:** `/admin/*`
**Authentication:** All routes require Supabase authentication
**Layout:** `app/admin/layout.tsx` (shared sidebar + terminal background)

### Authentication

#### `/admin/login` - Admin Sign In
**Purpose:** Authentication entry point
**Component:** `app/admin/login/page.tsx`
**Features:**
- Centered modal over terminal background
- Logo at top
- Email + password authentication
- Error messaging
- Redirect parameter support (`?redirect=...`)
- "Return to public site" link

**Obfuscation:** Generic "Sign In" language (no "admin" references visible)

---

### Dashboard & Overview

#### `/admin/dashboard` - Admin Overview
**Purpose:** Main admin dashboard with key statistics
**Component:** `app/admin/dashboard/page.tsx`
**Authentication:** Required
**Features:**
- Statistics grid:
  - Total projects
  - Active projects
  - Total inquiries
  - Pending inquiries
  - Total pools
- Recent inquiries list (5 most recent)
- Recent projects list (5 most recent)
- Status badges (Active/Inactive, Pending/Approved/etc.)
- Live indicator with pulse animation
- Quick action links

**Data Sources:**
- `projects` table
- `inquiries` table
- `pools` table

---

### Project Management

#### `/admin/projects` - Projects List
**Purpose:** View and manage all projects
**Component:** `app/admin/projects/page.tsx`
**Authentication:** Required
**Features:**
- Projects table with columns:
  - Icon + name/slug
  - Pool count
  - Data status (Chart, Holders, Burns availability)
  - Created date
  - Active/Inactive toggle
  - Actions dropdown
- Empty state with import CTA

**Project Actions:**
- Preview project
- Edit project
- Delete project
- Activate/Deactivate

#### `/admin/projects/import` - Import from Migrate.Fun
**Purpose:** Import projects directly from Migrate.Fun protocol
**Component:** `app/admin/projects/import/page.tsx`
**Authentication:** Required
**Features:**
- Two-step wizard:
  1. Enter Migrate.Fun URL
  2. Preview migration data
- Auto-fetches:
  - Project name
  - Old token (symbol, address)
  - New token (symbol, address)
  - Exchange rate
  - Migration dates
- Import button
- Success state with redirect
- Error handling

**API:** `POST /api/migrate-fun/import`

---

### Inquiries Management

#### `/admin/inquiries` - Listing Requests
**Purpose:** Review and manage project listing requests from contact form
**Component:** `app/admin/inquiries/page.tsx`
**Authentication:** Required
**Features:**
- Inquiries table with:
  - Project name + token addresses
  - Contact info (name, email, Telegram)
  - Migrate.Fun URL
  - Status badge
  - Actions dropdown
- Status types: Pending, Contacted, Approved, Rejected
- Pending count highlight

**Inquiry Actions:**
- View full details
- Change status
- Send message (future feature)

---

## API Routes

All API routes are serverless functions in `/app/api/`

### Public API

#### Chart Data
```
GET  /api/pools/:slug/:timeframe           - Candlestick OHLCV data
GET  /api/fees/:slug?timeframe=...         - Fee analytics
GET  /api/holders/:slug?timeframe=...      - Holder distribution
GET  /api/burns/:slug?timeframe=...        - Token burn transactions
```

#### Token Data
```
GET  /api/token-balance?address=...&mint=... - Wallet's token balance
GET  /api/wallet-balance?address=...         - Wallet's SOL balance
```

#### Projects
```
GET  /api/projects           - List all published projects
GET  /api/projects/:slug     - Get specific project details
```

#### Contact
```
POST /api/inquiries          - Submit listing request
GET  /api/inquiries/notify   - Webhook for notifications
```

---

### Admin API (Protected)

#### Authentication
```
GET  /api/admin/auth/check   - Verify admin session
```

#### Projects Management
```
GET  /api/admin/projects/:id        - Get project details
PUT  /api/admin/projects/:id        - Update project
POST /api/admin/backfill-holders    - Backfill historical holder data
POST /api/admin/backfill-burns      - Backfill historical burn data
POST /api/admin/backfill-burns-since-date  - Backfill burns from date
```

#### Inquiries Management
```
GET  /api/admin/inquiries/:id   - Get inquiry details
PUT  /api/admin/inquiries/:id   - Update inquiry status
```

#### Migrate.Fun Integration
```
POST /api/migrate-fun/import           - Import project from Migrate.Fun
GET  /api/migrate-fun/project/:id      - Fetch Migrate.Fun project data
```

---

### Background Jobs (Cron)

```
POST /api/cron/sync-migrations   - Sync pool migrations
POST /api/cron/sync-burns        - Sync token burns
POST /api/cron/collect-holders   - Collect holder snapshots
```

---

## User Flows

### New Visitor Flow
```
Landing (/)
  → See Example (/zera)
  → Explore charts
  → Contact (/contact) to add token
```

### Admin Flow
```
Click Login Button
  → LoginModal appears (centered)
  → Authenticate
  → Dashboard (/admin/dashboard)
  → Manage Projects (/admin/projects)
  → Import from Migrate.Fun (/admin/projects/import)
  → Review Inquiries (/admin/inquiries)
```

### Project Team Flow
```
Landing (/)
  → Add Your Token (CTA)
  → Contact Form (/contact)
  → Submit inquiry
  → Success confirmation
  → Admin reviews in /admin/inquiries
```

---

## Authentication & Authorization

### Public Access
- Landing page
- All token dashboard pages (`:token`)
- Fees/Holders/Burns views
- Contact form

### Admin Access (Requires Supabase Auth)
- All `/admin/*` routes
- Preview mode (`/preview/:token`)

### Authentication Flow
1. Server-side `getUser()` check on protected routes
2. Redirect to `/admin/login?redirect=...` if not authenticated
3. After login, redirect to original destination
4. Session managed via Supabase Auth

---

## Navigation Structure

### Public Site Navigation
```
Header:
  └─ Logo (links to /)

Footer:
  ├─ Home (/)
  ├─ Contact (/contact)
  └─ Twitter (@Trenchooooor)
```

### Admin Navigation (Sidebar)
```
Logo + "Dashboard" + "Authorized" badge

Navigation:
  ├─ Overview (/admin/dashboard)
  ├─ Projects (/admin/projects)
  ├─ Inquiries (/admin/inquiries)
  └─ Import (/admin/projects/import)

External:
  └─ View Public Site (/)

Footer:
  ├─ System Online (status indicator)
  └─ Sign Out
```

### Token Page Navigation (Mobile)
```
Menu Button →
  Settings Tab:
    ├─ Token Switcher
    ├─ View Mode (Chart/Holders/Fees/Burns)
    ├─ Timeframe selector
    ├─ Stats display
    ├─ Chart controls (if chart view)
    └─ Follow on Twitter

  About Tab:
    ├─ What You're Viewing
    ├─ Token Journey
    ├─ Chart Controls guide
    └─ Data Sources
```

---

## External Links

### Integrated Services
- **DexScreener**: Links to token pools (`https://dexscreener.com/solana/:address`)
- **Twitter**: `@Trenchooooor`
- **Migrate.Fun**: Import integration (`https://migrate.fun/claim/...`)

### Data Sources
- Jupiter API
- DexScreener API
- GeckoTerminal API
- On-chain Solana data

---

## Special Pages & States

### Loading States
- `TokenLoadingLogo` component with custom project loader SVGs
- Skeleton components for each view (Chart, Fees, Holders, Burns)

### Error States
- 404: Not Found (default Next.js behavior)
- API errors: Inline error messages
- Auth errors: Displayed in login forms

### Empty States
- No projects: "No projects yet" with import CTA
- No inquiries: "No inquiries yet"
- No data: Loading skeletons while fetching

---

## Modal/Overlay Components

### DonationPopup
**Trigger:** Auto-shows 10 seconds after page load (once per 24 hours)
**Z-Index:** `z-[200]`
**Features:**
- Backdrop blur
- Copy donation address
- Progress bars (SOL + Token goals)
- Animated effects

### LoginModal
**Trigger:** Click login button (user icon in header)
**Z-Index:** `z-[9999]` / `z-[10000]`
**Features:**
- Rendered via React Portal (document.body)
- Centered over all content
- Email/password form
- Obfuscated (no admin references)

### Mobile Menu (Token Pages)
**Trigger:** Menu button on mobile
**Z-Index:** `z-40` (backdrop), `z-50` (menu)
**Features:**
- Two tabs: Settings, About
- Full-screen overlay
- Fade in/out animations

---

## Page Statistics

| Category | Count |
|----------|-------|
| **Public Pages** | 5 |
| **Admin Pages** | 6 |
| **API Endpoints** | 18+ |
| **Dynamic Routes** | 3 |
| **Modal Components** | 3 |

---

## URL Parameters

### Token Dashboard (`/:token`)
```
?chartTimeframe=1H|4H|8H|1D|MAX    - Chart timeframe
?view=chart|fees|holders|burns     - Active view mode
?feesTimeframe=7D|30D|90D|ALL      - Fees timeframe
?holdersTimeframe=1D|7D|30D|90D|ALL - Holders timeframe
?burnsTimeframe=1D|7D|30D|90D|ALL  - Burns timeframe
```

### Admin Login
```
?redirect=/admin/dashboard    - Post-login redirect destination
```

---

## Technical Notes

### Routing System
- **Framework:** Next.js 14+ App Router
- **File-based routing:** All routes defined in `/app` directory
- **Dynamic segments:** `[token]`, `[slug]` for parameterized routes

### Data Fetching
- **Client-side:** SWR for real-time updates with configurable refresh intervals
- **Server-side:** Direct Supabase queries in Server Components
- **Caching:** SWR deduplication and revalidation strategies

### SEO & Metadata
- Dynamic titles: `{ProjectName} | {Price}` on token pages
- Metadata configuration in root layout
- Vercel Analytics integration

---

## Future Routes (Potential)

Based on codebase structure, potential future pages:

- `/docs` - Documentation/guides
- `/api-docs` - API documentation for developers
- `/pricing` - Premium features pricing
- `/about` - About the platform
- `/:token/api` - Per-token API access (premium)
- `/admin/users` - User management
- `/admin/settings` - Platform settings
- `/admin/analytics` - Usage analytics

---

## Deployment URLs

- **Production:** `https://migrate-chart.fun`
- **Vercel Preview:** Auto-generated per branch
- **Admin Access:** `https://migrate-chart.fun/admin/login`

---

Last Updated: December 6, 2024
