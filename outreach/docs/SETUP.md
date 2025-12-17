# X API Setup Guide

## What You Need to Do Next

### Step 1: Get Your X API Credentials (5 minutes)

1. Go to https://developer.x.com/en/portal/dashboard
2. Click on your project (or create one if needed)
3. Navigate to **"Keys and tokens"** section
4. Generate/copy these credentials:
   - **API Key** (also called Consumer Key)
   - **API Secret** (also called Consumer Secret)
   - **Bearer Token** ← This is what we'll use (simplest)

### Step 2: Set Up Environment Variables (2 minutes)

Create/edit `.env.local` in the `outreach` folder:

```bash
# X API Credentials
X_BEARER_TOKEN=your_bearer_token_here
X_API_KEY=your_api_key_here
X_API_SECRET=your_api_secret_here

# Target account
MIGRATE_FUN_HANDLE=MigrateFun
```

### Step 3: Install Dependencies (1 minute)

```bash
cd outreach
npm init -y
npm install dotenv axios
```

### Step 4: Run the Script (30 seconds)

```bash
node fetch-tweets.js
```

This will:
- Fetch last 100 tweets from @MigrateFun
- Extract project names and Twitter handles
- Identify migration dates
- Generate updated outreach list
- Save to `leads-YYYY-MM-DD.json`

---

## What Gets Automated

✅ Daily tweet fetching (7 days of history on free tier)
✅ Project extraction from "excited to support @ProjectName" tweets
✅ Migration date parsing
✅ Engagement metrics (views, likes, retweets)
✅ Contact info extraction

---

## Rate Limits (Free Tier)

- 300 requests per 15 minutes
- ~1,500 tweets per request cycle
- More than enough for daily checks

---

## Next Steps After Setup

1. Run script manually to test
2. Set up daily cron job (optional)
3. Review generated leads
4. Start personalized outreach

---

## Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Keep Bearer Token secret
- Rotate tokens if exposed
