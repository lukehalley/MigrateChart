# Outreach Automation

Tools for finding and contacting migration projects via X API.

## 📁 Folder Structure

```
outreach/
├── scripts/          # Automation scripts
│   └── fetch-tweets.js
├── data/            # Generated leads & source data
│   ├── leads-*.json
│   ├── TwExtract-MigrateFun-152.csv
│   └── migrate-fun.txt
├── docs/            # Documentation & tracking
│   ├── SETUP.md
│   ├── OUTREACH_LIST.md
│   └── OUTREACH_TRACKER.csv
└── templates/       # Message templates
    └── dm-templates.md
```

## 🚀 Quick Start

1. **Get X API credentials** from https://developer.x.com/en/portal/dashboard
2. **Add Bearer Token** to `../.env` (already done ✅)
3. **Install dependencies**: `npm install`
4. **Run scraper**: `node scripts/fetch-tweets.js`

## 📊 What You Get

Script generates `data/leads-YYYY-MM-DD.json` with:
- 15+ qualified leads from last 100 tweets
- Engagement metrics (views, likes, RTs)
- Migration dates and URLs
- Contact timing recommendations

## 📝 Daily Workflow

```bash
# 1. Fetch latest projects
node scripts/fetch-tweets.js

# 2. Review new leads
cat data/leads-$(date +%Y-%m-%d).json | jq '.projects[0:5]'

# 3. Update tracker
# Edit docs/OUTREACH_TRACKER.csv

# 4. Send DMs
# Use templates/dm-templates.md
```

## 🎯 Priority Targets (This Week)

From latest scan:
1. **@rainmakerdotfun** (6.7K views) - Dec 9 start - $5-10K tier
2. **@AgentNyla** (5.5K views) - Dec 9 start - $5-10K tier (AI agent)
3. **@swarmnode** (4.8K views) - Dec 9 start - $5-10K tier
4. **@ParagonTweaks** (3.9K views) - Dec 9 start - $5-10K tier (180K downloads)
5. **@realisworlds** (2.8K views) - Dec 9 start - $5-10K tier (Gaming)

**All projects start Dec 9 - send DMs TODAY for pre-launch positioning**

## 📂 Files Reference

- **`docs/OUTREACH_TRACKER.csv`** - Track outreach status & notes
- **`docs/OUTREACH_LIST.md`** - Full project analysis
- **`templates/dm-templates.md`** - Generic message templates
- **`templates/personalized-examples.md`** - Specific examples for top targets
- **`data/leads-*.json`** - Auto-generated from X API
