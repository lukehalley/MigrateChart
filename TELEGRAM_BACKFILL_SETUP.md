# Telegram Holder Data Backfill Setup Guide

This guide will help you set up and run the Telegram backfill script to extract historical holder counts from your Telegram group chat.

## Prerequisites

1. Python 3.7 or higher
2. A Telegram account (the one you use to access the group)
3. Access to the Telegram group where "Skeleton Price Bot" posts holder counts

## Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `pyrogram` - The Telegram MTProto library
- `tgcrypto` - Cryptography library for faster performance

## Step 2: Get Telegram API Credentials

1. Go to https://my.telegram.org/apps
2. Log in with your phone number
3. Click on "API development tools"
4. Fill in the application details (you can use any name)
5. You'll receive:
   - `api_id` (a number like `12345678`)
   - `api_hash` (a string like `0123456789abcdef0123456789abcdef`)

**Important:** Keep these credentials private! Don't commit them to Git.

## Step 3: Find Your Chat ID

You have several options to identify the chat:

### Option A: Use the chat username (if it's public)
```python
CHAT_ID = "@yourchatusername"  # or just "yourchatusername"
```

### Option B: Get the numeric Chat ID

1. Open the Telegram group in your web browser or desktop app
2. Look at the URL or info section for the chat ID
3. For groups, it usually looks like `-1001234567890`

### Option C: Let the script find it for you

Run this helper code once:

```python
from pyrogram import Client

api_id = YOUR_API_ID
api_hash = "YOUR_API_HASH"

async def list_chats():
    async with Client("my_session", api_id, api_hash) as app:
        async for dialog in app.get_dialogs():
            print(f"{dialog.chat.title}: {dialog.chat.id}")

import asyncio
asyncio.run(list_chats())
```

## Step 4: Configure the Script

Open `generator/scripts/telegram_holder_backfill.py` and update these variables:

```python
API_ID = 12345678  # Your API ID (integer)
API_HASH = "0123456789abcdef0123456789abcdef"  # Your API Hash (string)
CHAT_ID = -1001234567890  # Your chat ID or "@username"
```

## Step 5: Run the Script

```bash
cd generator/scripts
python telegram_holder_backfill.py
```

### First Run - Authentication

On the first run, Pyrogram will ask you to authenticate:

1. **Phone number:** Enter your phone number with country code (e.g., `+1234567890`)
2. **Verification code:** Telegram will send you a code via the app. Enter it.
3. **2FA Password:** If you have two-factor authentication enabled, enter your password.

A session file will be created (e.g., `zera_telegram_session.session`) so you won't need to authenticate again.

## Step 6: Review the Output

The script will:
1. Connect to Telegram
2. Search for all messages containing "Holders of ZERA token:"
3. Extract the holder counts and timestamps
4. Save the data to `output/holder_backfill_data.json`

### Output Format

```json
{
  "extracted_at": "2025-11-18T12:00:00",
  "total_records": 150,
  "date_range": {
    "start": "2025-01-01T00:00:00",
    "end": "2025-11-18T12:00:00"
  },
  "data": [
    {
      "message_id": 12345,
      "date": "2025-01-01T08:00:00",
      "timestamp": 1735718400,
      "holder_count": 4500,
      "text": "Holders of ZERA token: 4500"
    },
    ...
  ]
}
```

## Troubleshooting

### "Phone number is invalid"
- Make sure to include the country code (e.g., `+1` for USA)
- No spaces or special characters except `+`

### "Chat not found"
- Try using the numeric chat ID instead of username
- Make sure you're a member of the chat
- For private chats, you need the numeric ID

### "Too many requests"
If you hit rate limits:
- Add a delay between requests (already implemented in the script)
- Wait a few minutes before trying again
- Reduce the `limit` parameter in `search_messages()`

### Script is slow
This is normal for large chat histories. The script searches through potentially thousands of messages. Be patient!

## Security Notes

1. **Never commit your session file** (`.session`) to Git - it's like a password
2. **Never share your API credentials**
3. **Keep your `api_hash` private**
4. The script only reads messages you already have access to - it's completely legitimate

## Next Steps

After you have the `holder_backfill_data.json` file:

1. Parse the JSON data
2. Insert it into your database
3. Optionally, set up the script to run periodically to catch new messages

## Optional: Automated Collection

You can modify the script to run as a cron job or scheduled task to continuously collect new holder data:

```python
# Add this to fetch only recent messages
from datetime import datetime, timedelta

last_day = datetime.now() - timedelta(days=1)

async for message in app.search_messages(
    chat_id=chat_id,
    query="Holders of ZERA token:",
    offset_date=last_day.timestamp()
):
    # Process message...
```

## Support

If you encounter issues:
1. Check the Pyrogram documentation: https://docs.pyrogram.org
2. Verify your API credentials are correct
3. Make sure you have the latest version: `pip install -U pyrogram`
