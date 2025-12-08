# Admin Dashboard & Migrate.Fun Integration - Implementation Plan

## Overview

Integrate migrate-chart.fun with migrate.fun to offer automated project listings as a value-add package for migration clients. When a project completes migration via migrate.fun, they can purchase a listing package on migrate-chart.fun for comprehensive analytics and community transparency.

## Business Model

**Partnership with migrate.fun:**
- Offer as optional add-on during migration process
- Project admins pay for listing (pricing TBD)
- Automated onboarding reduces manual work
- Win-win-win: migrate.fun adds value, projects get analytics, we get revenue

---

## Key Requirements

1. **Admin Dashboard**: Easy UI for adding/managing projects
2. **migrate.fun API Integration**: Auto-fetch migration data
3. **Inquiry System**: Handle inbound requests (email service integration)
4. **Migration Stats Display**: Show migration progress on project pages
5. **Authentication**: Secure admin access

---

## Technical Analysis from HAR File

### Migrate.Fun Data Structure

**Migration Program Account**: `12SZH9wwMTxiajoPxnaCNtpJUWL698TUu1h2g4Ci3rZ5`
- Program: `migK824DsBMp2eZXdhSBAWFS6PbvA6UN8DV15HfmstR`
- Contains base64-encoded migration data

**Decoded Account Data Includes:**
```
- Project ID: "mig79"
- Project Name: "PAYAI Migration"
- Old Token Address
- New Token Address
- Migration start/end timestamps
- Exchange rate
- Total migrated amounts
```

**Token Metadata Sources:**
1. **Solana RPC**: Mint info (supply, decimals)
2. **Metaplex Standard**: Token metadata account
3. **IPFS**: Full metadata (name, symbol, description, image, socials)

### API Endpoints Needed

```typescript
// Migrate.fun integration
GET  /api/migrate-fun/project/:migrationId
POST /api/migrate-fun/import

// Admin dashboard
GET  /api/admin/projects
POST /api/admin/projects
PUT  /api/admin/projects/:id
DELETE /api/admin/projects/:id

// Inquiry system
POST /api/inquiries
GET  /api/admin/inquiries
```

---

## Database Schema Changes

### New Tables

#### `inquiries` Table
```sql
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram TEXT,
  project_name TEXT NOT NULL,
  old_token_address TEXT NOT NULL,
  new_token_address TEXT NOT NULL,
  migrate_fun_url TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, contacted, approved, rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `admin_users` Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, super_admin
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);
```

#### Extend `projects` Table
```sql
ALTER TABLE projects ADD COLUMN migrate_fun_id TEXT;
ALTER TABLE projects ADD COLUMN migrate_fun_url TEXT;
ALTER TABLE projects ADD COLUMN migration_start_date TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN migration_end_date TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN exchange_rate NUMERIC;
ALTER TABLE projects ADD COLUMN total_migrated NUMERIC;
ALTER TABLE projects ADD COLUMN migration_status TEXT; -- active, completed, failed
```

#### Extend `pools` Table
```sql
ALTER TABLE pools ADD COLUMN is_legacy BOOLEAN DEFAULT false;
ALTER TABLE pools ADD COLUMN migration_source TEXT; -- pump_fun, raydium, meteora
```

---

## Implementation Phases

### Phase 1: Foundation (Day 1-2)

#### 1.1 Database Setup
- [ ] Create migration for new tables
- [ ] Add columns to existing tables
- [ ] Set up RLS policies
- [ ] Create admin user seed data

#### 1.2 Authentication
- [ ] Install next-auth or clerk
- [ ] Create login page (`/admin/login`)
- [ ] Set up session management
- [ ] Implement role-based access control

### Phase 2: Migrate.Fun Integration (Day 3-4)

#### 2.1 Solana Program Parser
```typescript
// lib/migrateFun.ts

interface MigrationData {
  migrationId: string;
  projectName: string;
  oldTokenAddress: string;
  newTokenAddress: string;
  startTimestamp: number;
  endTimestamp: number;
  exchangeRate: number;
  totalMigrated: number;
  status: 'active' | 'completed' | 'failed';
}

async function fetchMigrationData(migrationId: string): Promise<MigrationData>
async function decodeMigrationAccount(accountData: string): MigrationData
async function getTokenMetadata(tokenAddress: string)
```

#### 2.2 API Routes
- [ ] `/api/migrate-fun/project/:id` - Fetch migration data
- [ ] `/api/migrate-fun/import` - Import project from migrate.fun
- [ ] `/api/migrate-fun/stats/:id` - Real-time migration stats

### Phase 3: Admin Dashboard (Day 5-7)

#### 3.1 Admin Layout
```
/admin
├── /login          - Authentication
├── /dashboard      - Overview stats
├── /projects       - Manage projects
│   ├── /new        - Add new project
│   ├── /edit/:id   - Edit project
│   └── /import     - Import from migrate.fun
└── /inquiries      - View/manage inquiries
```

#### 3.2 Project Management UI

**Add Project Form** (`/admin/projects/new`):
- Basic info: Name, slug, colors, logo
- Migration source: Manual or Import from migrate.fun
- Pool configuration: Addresses, DEX types, fee rates
- Migration timeline: Start/end dates, exchange rate
- Settings: Burns enabled, active status

**Import from Migrate.Fun** (`/admin/projects/import`):
- Input: migrate.fun URL or project ID
- Auto-fetch: Token addresses, metadata, timeline
- Preview: Show all data before saving
- One-click: Create project + pools + migrations

**Project List** (`/admin/projects`):
- Table view with filters
- Quick actions: Edit, Delete, Toggle Active
- Status indicators: Active/Inactive, Migration status
- Search by name/slug

### Phase 4: Inquiry System (Day 8)

#### 4.1 Public Inquiry Form
```typescript
// app/contact/page.tsx
interface InquiryForm {
  name: string;
  email: string;
  telegram?: string;
  projectName: string;
  oldTokenAddress: string;
  newTokenAddress: string;
  migrateFunUrl?: string;
  message?: string;
}
```

**Form Fields:**
- Contact info (name, email, telegram)
- Project details (name, token addresses)
- Optional: migrate.fun link
- Message/additional info

#### 4.2 Email Integration

**Option A: Resend (Recommended)**
- 100 emails/day on starter tier
- API key in env vars
- Professional templates

**Option B: Formspree**
- Form endpoint
- Email notifications

**Option C: Simple DB Storage + Manual**
- Store in Supabase
- Admin checks dashboard
- Manual follow-up

**Implementation:**
```bash
npm install resend
```

```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInquiryNotification(inquiry: InquiryForm) {
  await resend.emails.send({
    from: 'notifications@migrate-chart.fun',
    to: process.env.ADMIN_EMAIL,
    subject: `New Project Inquiry: ${inquiry.projectName}`,
    html: EmailTemplate(inquiry)
  });
}
```

#### 4.3 Inquiry Management
- [ ] View all inquiries in admin dashboard
- [ ] Filter by status (pending, contacted, approved, rejected)
- [ ] Update status and add notes
- [ ] Quick action: "Import to Projects"

### Phase 5: Migration Stats Display (Day 9)

#### 5.1 UI Components

**Migration Progress Card** (for active migrations):
```tsx
<Card>
  <h3>Migration Progress</h3>
  <ProgressBar
    current={totalMigrated}
    total={totalSupply}
    percentage={migrationPercentage}
  />
  <Stats>
    <Stat label="Total Migrated" value={formatNumber(totalMigrated)} />
    <Stat label="Exchange Rate" value={`1:${exchangeRate}`} />
    <Stat label="Time Remaining" value={timeRemaining} />
  </Stats>
</Card>
```

**Migration History Timeline** (for completed):
```tsx
<Timeline>
  <Event
    date={startDate}
    label="Migration Started"
    icon={<RocketIcon />}
  />
  <Event
    date={endDate}
    label="Migration Completed"
    icon={<CheckIcon />}
  />
  <Event
    date={poolCreatedDate}
    label="New Pool Created"
    icon={<PoolIcon />}
  />
</Timeline>
```

#### 5.2 Real-Time Updates
- [ ] SWR hook for migration stats
- [ ] Refresh interval based on migration status
- [ ] WebSocket for live updates (optional enhancement)

---

## Implementation Details

### 1. Migrate.Fun Data Fetching

```typescript
// lib/migrateFun.ts

const MIGRATION_PROGRAM = 'migK824DsBMp2eZXdhSBAWFS6PbvA6UN8DV15HfmstR';

export async function fetchMigrationByUrl(url: string): Promise<MigrationProject> {
  // Extract project ID from URL: https://migrate.fun/claim/mig79
  const migrationId = url.match(/\/claim\/(\w+)/)?.[1];

  if (!migrationId) {
    throw new Error('Invalid migrate.fun URL');
  }

  return fetchMigrationById(migrationId);
}

export async function fetchMigrationById(migrationId: string): Promise<MigrationProject> {
  // 1. Find migration account PDA
  const [migrationPda] = await PublicKey.findProgramAddress(
    [Buffer.from('migration'), Buffer.from(migrationId)],
    new PublicKey(MIGRATION_PROGRAM)
  );

  // 2. Fetch account data
  const accountInfo = await connection.getAccountInfo(migrationPda);

  // 3. Decode migration data
  const migrationData = decodeMigrationAccount(accountInfo.data);

  // 4. Fetch token metadata
  const [oldTokenMeta, newTokenMeta] = await Promise.all([
    fetchTokenMetadata(migrationData.oldTokenAddress),
    fetchTokenMetadata(migrationData.newTokenAddress)
  ]);

  // 5. Get migration stats
  const stats = await getMigrationStats(migrationPda);

  return {
    migrationId,
    projectName: migrationData.projectName,
    oldToken: {
      address: migrationData.oldTokenAddress,
      ...oldTokenMeta
    },
    newToken: {
      address: migrationData.newTokenAddress,
      ...newTokenMeta
    },
    startDate: new Date(migrationData.startTimestamp * 1000),
    endDate: new Date(migrationData.endTimestamp * 1000),
    exchangeRate: migrationData.exchangeRate,
    totalMigrated: stats.totalMigrated,
    status: getMigrationStatus(migrationData, stats)
  };
}

function decodeMigrationAccount(data: Buffer): DecodedMigration {
  // Parse the binary layout based on migrate.fun program structure
  // Need to reverse-engineer from HAR base64 data
  const projectIdLength = data.readUInt32LE(8);
  const projectId = data.slice(12, 12 + projectIdLength).toString();
  // ... continue parsing
}

async function fetchTokenMetadata(address: string) {
  // 1. Get mint info
  const mintInfo = await connection.getParsedAccountInfo(new PublicKey(address));

  // 2. Get Metaplex metadata
  const [metadataPda] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(address).toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const metadataAccount = await connection.getAccountInfo(metadataPda);
  const metadata = decodeMetadata(metadataAccount.data);

  // 3. Fetch from IPFS if URI provided
  if (metadata.data.uri) {
    const ipfsData = await fetch(metadata.data.uri).then(r => r.json());
    return { ...metadata, ...ipfsData };
  }

  return metadata;
}
```

### 2. Admin Dashboard Architecture

```typescript
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  const { user } = useAuth();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

// app/admin/projects/import/page.tsx
export default function ImportProject() {
  const [migrationUrl, setMigrationUrl] = useState('');
  const [preview, setPreview] = useState<MigrationProject | null>(null);

  async function handleFetch() {
    const data = await fetch(`/api/migrate-fun/project/${migrationUrl}`);
    setPreview(data);
  }

  async function handleImport() {
    // Create project + pools + migrations in single transaction
    await createProjectFromMigration(preview);
  }

  return (
    <div>
      <h1>Import from Migrate.Fun</h1>
      <Input
        placeholder="https://migrate.fun/claim/mig79"
        value={migrationUrl}
        onChange={(e) => setMigrationUrl(e.target.value)}
      />
      <Button onClick={handleFetch}>Fetch Migration Data</Button>

      {preview && (
        <PreviewCard data={preview}>
          <Button onClick={handleImport}>Import Project</Button>
        </PreviewCard>
      )}
    </div>
  );
}
```

### 3. Inquiry Form

```typescript
// app/contact/page.tsx
export default function ContactPage() {
  async function handleSubmit(data: InquiryForm) {
    // Store in database
    const { error } = await supabase
      .from('inquiries')
      .insert(data);

    // Send email notification
    await fetch('/api/inquiries/notify', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    toast.success('Inquiry submitted! We\'ll be in touch soon.');
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" label="Name" required />
      <Input name="email" type="email" label="Email" required />
      <Input name="telegram" label="Telegram (optional)" />
      <Input name="projectName" label="Project Name" required />
      <Input name="oldTokenAddress" label="Old Token Address" required />
      <Input name="newTokenAddress" label="New Token Address" required />
      <Input name="migrateFunUrl" label="Migrate.Fun URL (if applicable)" />
      <Textarea name="message" label="Additional Info" />
      <Button type="submit">Submit Inquiry</Button>
    </form>
  );
}
```

### 4. Migration Stats Component

```typescript
// components/MigrationStats.tsx
export function MigrationStats({ projectId }: { projectId: string }) {
  const { data: project } = useSWR(`/api/projects/${projectId}`);

  if (!project.migrate_fun_id) {
    return null;
  }

  const { data: stats } = useSWR(
    `/api/migrate-fun/stats/${project.migrate_fun_id}`,
    { refreshInterval: 30000 } // Poll every 30s during active migration
  );

  const isActive = new Date() < new Date(project.migration_end_date);
  const percentage = (stats.totalMigrated / stats.oldTokenSupply) * 100;

  return (
    <Card className="mb-6">
      <h3>Migration Progress</h3>
      {isActive ? (
        <>
          <ProgressBar value={percentage} />
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Stat label="Migrated" value={formatNumber(stats.totalMigrated)} />
            <Stat label="Exchange Rate" value={`1:${project.exchange_rate}`} />
            <Stat label="Time Left" value={formatTimeRemaining(project.migration_end_date)} />
          </div>
        </>
      ) : (
        <Timeline>
          <TimelineEvent date={project.migration_start_date} label="Migration Started" />
          <TimelineEvent date={project.migration_end_date} label="Migration Ended" />
          <TimelineEvent date={stats.poolCreatedDate} label="New Pool Created" />
        </Timeline>
      )}
    </Card>
  );
}
```

---

## File Structure

```
webapp/
├── app/
│   ├── admin/
│   │   ├── layout.tsx                  # Admin shell with sidebar
│   │   ├── login/page.tsx              # Authentication
│   │   ├── dashboard/page.tsx          # Overview stats
│   │   ├── projects/
│   │   │   ├── page.tsx                # Projects list
│   │   │   ├── new/page.tsx            # Manual add form
│   │   │   ├── import/page.tsx         # Import from migrate.fun
│   │   │   └── [id]/edit/page.tsx      # Edit project
│   │   └── inquiries/
│   │       └── page.tsx                # Inquiries list
│   ├── contact/
│   │   └── page.tsx                    # Public inquiry form
│   └── api/
│       ├── admin/
│       │   ├── projects/route.ts
│       │   └── inquiries/route.ts
│       ├── migrate-fun/
│       │   ├── project/[id]/route.ts   # Fetch migration data
│       │   ├── import/route.ts         # Import project
│       │   └── stats/[id]/route.ts     # Migration stats
│       └── inquiries/
│           ├── route.ts                # Submit inquiry
│           └── notify/route.ts         # Send email
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── InquiriesList.tsx
│   │   └── MigrateFunImporter.tsx
│   └── MigrationStats.tsx              # Public migration progress
└── lib/
    ├── migrateFun.ts                   # Migrate.fun integration
    ├── auth.ts                         # Authentication helpers
    └── email.ts                        # Email service
```

---

## Environment Variables

```bash
# Admin Authentication
ADMIN_SECRET_KEY=your-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_EMAIL=admin@migrate-chart.fun

# Migrate.Fun Integration
MIGRATE_FUN_RPC=https://api.mainnet-beta.solana.com
```

---

## Migration Stats Cache Strategy

**Challenge**: Migrate.fun data requires RPC calls to decode program accounts

**Solution**: Background cron job

```typescript
// app/api/cron/update-migration-stats/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get all projects with active migrations
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('migration_status', 'active');

  // Update each project's migration stats
  for (const project of projects) {
    const stats = await fetchMigrationStats(project.migrate_fun_id);

    await supabase
      .from('projects')
      .update({
        total_migrated: stats.totalMigrated,
        migration_status: stats.status,
        updated_at: new Date()
      })
      .eq('id', project.id);
  }

  return Response.json({ updated: projects.length });
}
```

**Vercel Cron Config** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/update-migration-stats",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Security Considerations

### Admin Authentication
- Use bcrypt for password hashing
- JWT tokens with short expiration
- CSRF protection
- Rate limiting on login endpoint

### API Security
- Admin routes behind auth middleware
- RLS policies on all tables
- Input validation and sanitization
- SQL injection prevention

### Inquiry Form
- Rate limiting (max 5 submissions/hour/IP)
- Email validation
- Captcha for spam prevention (optional)
- XSS protection

---

## Testing Plan

### Unit Tests
- [ ] Migration data parser
- [ ] Token metadata fetcher
- [ ] Email service

### Integration Tests
- [ ] Import flow from migrate.fun URL
- [ ] Project creation with all related tables
- [ ] Inquiry submission and notification

### E2E Tests
- [ ] Admin login → Import project → View on site
- [ ] User submits inquiry → Admin reviews → Approves → Project created
- [ ] Migration stats display and updates

---

## Deployment Checklist

- [ ] Create admin user in production
- [ ] Set up Resend account and verify domain
- [ ] Configure environment variables
- [ ] Test migrate.fun integration on mainnet
- [ ] Set up Vercel cron job
- [ ] Create admin dashboard documentation
- [ ] Prepare pricing page for migrate.fun partnership

---

## Next Steps (Immediate)

1. **Database Migrations** (30 min)
   - Create new tables
   - Add columns
   - Set up RLS

2. **Migrate.Fun Parser** (2-3 hours)
   - Decode account data structure
   - Test with real migration accounts
   - Handle edge cases

3. **Admin Auth** (1-2 hours)
   - Choose auth solution (next-auth vs clerk)
   - Implement login flow
   - Protect admin routes

4. **Basic Admin UI** (3-4 hours)
   - Projects list
   - Add/edit forms
   - Import from migrate.fun

5. **Inquiry Form** (1 hour)
   - Public contact page
   - Email integration
   - Admin view

---

## Success Metrics

### Technical
- Admin can import project in < 2 minutes
- Migration stats update every 15 minutes
- Zero manual database editing required

### Business
- Conversion rate: inquiries → paid listings
- Time to onboard: inquiry → live project
- Customer satisfaction with analytics

---

## Future Enhancements

1. **Automated Onboarding**
   - migrate.fun webhook integration
   - Auto-create project on migration start
   - Email admin for approval

2. **Enhanced Analytics**
   - Holder retention analysis (old → new)
   - Price impact from migration
   - Volume comparison pre/post migration

3. **White Label**
   - Custom domains for projects
   - Branded analytics pages
   - Embeddable widgets

4. **API Access**
   - Public API for migration stats
   - Webhooks for status changes
   - Developer dashboard

---
