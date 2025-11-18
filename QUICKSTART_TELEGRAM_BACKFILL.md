# Quick Start: Telegram Holder Data Backfill

This is a quick reference guide to get you started with backfilling holder data from Telegram.

## 📋 TL;DR

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Get API credentials from https://my.telegram.org/apps

# 3. Find your chat ID (optional helper)
python generator/scripts/find_chat_id.py

# 4. Update configuration in telegram_holder_backfill.py
# Set API_ID, API_HASH, and CHAT_ID

# 5. Run the backfill
python generator/scripts/telegram_holder_backfill.py

# 6. Process the data (optional)
python generator/scripts/process_holder_data.py
```

## 📁 What You'll Get

After running the backfill, you'll have:

1. **`output/holder_backfill_data.json`** - Raw extracted data from Telegram
2. **`output/holder_history.csv`** - Clean CSV format (after processing)
3. **`output/holder_summary.txt`** - Statistical summary report

## 🔑 Getting API Credentials (30 seconds)

1. Go to https://my.telegram.org/apps
2. Log in with your phone number
3. Click "API development tools"
4. Fill in any app name (e.g., "ZERA Holder Tracker")
5. Copy your `api_id` and `api_hash`

## 🔍 Finding Your Chat ID (Option 1: Quick)

If you know the group username:
```python
CHAT_ID = "@yourgroupname"  # or just "yourgroupname"
```

## 🔍 Finding Your Chat ID (Option 2: Helper Script)

1. Edit `generator/scripts/find_chat_id.py`:
   - Set `API_ID` and `API_HASH`

2. Run it:
   ```bash
   python generator/scripts/find_chat_id.py
   ```

3. Look through the list for your group and copy the Chat ID

## ⚙️ Configuration

Edit `generator/scripts/telegram_holder_backfill.py`:

```python
API_ID = 12345678  # Your API ID
API_HASH = "your_api_hash_here"  # Your API Hash
CHAT_ID = -1001234567890  # Your chat ID or "@username"
```

## 🚀 Running the Backfill

```bash
cd generator/scripts
python telegram_holder_backfill.py
```

**First time only:** You'll be prompted to:
1. Enter your phone number (with country code, e.g., `+1234567890`)
2. Enter the verification code Telegram sends you
3. Enter your 2FA password (if you have one)

A session file will be saved so you won't need to authenticate again.

## 📊 Processing the Data

After the backfill completes, process the data:

```bash
python generator/scripts/process_holder_data.py
```

This will:
- Convert JSON to CSV format
- Generate summary statistics
- Identify significant holder count changes

## 📈 Example Output

```
HOLDER DATA SUMMARY
======================================================================

Data Collection Period:
  Start: 2025-01-01 08:00:00
  End:   2025-11-18 12:00:00
  Duration: 322 days

Holder Statistics:
  Total data points: 156
  Minimum holders: 4,500
  Maximum holders: 4,775
  Average holders: 4,650

Growth Analysis:
  Starting holders: 4,500
  Ending holders: 4,704
  Net change: +204
  Percentage change: +4.53%
```

## 🎯 What's Next?

After you have the CSV file, you can:

1. **Import into a database:**
   ```python
   import pandas as pd
   df = pd.read_csv('output/holder_history.csv')
   # Insert into your database
   ```

2. **Create visualizations:**
   ```python
   import matplotlib.pyplot as plt
   plt.plot(df['date'], df['holder_count'])
   plt.show()
   ```

3. **Set up automated collection:**
   - Run the script daily via cron job
   - Only fetch new messages since last run
   - Automatically update your database

## ⚠️ Important Notes

- **Session files** (`.session`) are like passwords - don't commit them to Git
- **API credentials** should be kept private
- The script is **read-only** - it cannot send messages or modify anything
- **Rate limits** may slow down large historical fetches (be patient!)

## 🐛 Troubleshooting

**"Phone number is invalid"**
- Include country code (e.g., `+1` for USA)

**"Chat not found"**
- Use the numeric chat ID instead of username
- Make sure you're a member of the chat

**Script is slow**
- This is normal for large histories
- The script may need to search thousands of messages

**"Flood wait"**
- You hit Telegram's rate limit
- Wait a few minutes and try again

## 📚 Full Documentation

For more details, see [TELEGRAM_BACKFILL_SETUP.md](TELEGRAM_BACKFILL_SETUP.md)

## 🎉 Success!

Once you've backfilled the data, you'll have complete historical holder counts that you can use for analysis, visualization, and tracking ZERA token growth over time.
