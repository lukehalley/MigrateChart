#!/usr/bin/env python3
"""
Helper script to list all your Telegram chats and their IDs

This makes it easy to find the chat ID you need for the backfill script.

Usage:
1. Set up your .env file with TELEGRAM_API_ID and TELEGRAM_API_HASH
2. Run: python find_chat_id.py
3. Find your group in the list and copy its ID
"""

import asyncio
import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Fix for Python 3.14+ event loop compatibility - MUST be before pyrogram import
if sys.version_info >= (3, 10):
    try:
        asyncio.get_event_loop()
    except RuntimeError:
        asyncio.set_event_loop(asyncio.new_event_loop())

from pyrogram import Client

# ============================================================================
# CONFIGURATION - Loaded from .env file
# ============================================================================

# Get your API credentials from https://my.telegram.org/apps
API_ID = int(os.getenv('TELEGRAM_API_ID'))
API_HASH = os.getenv('TELEGRAM_API_HASH')

SESSION_NAME = "zera_telegram_session"  # Use the same session file

# ============================================================================


async def list_all_chats():
    """List all chats with their IDs"""
    print("\n" + "="*70)
    print("TELEGRAM CHAT ID FINDER")
    print("="*70 + "\n")

    app = Client(SESSION_NAME, api_id=API_ID, api_hash=API_HASH)

    try:
        await app.start()
        print("✓ Connected to Telegram\n")
        print("Fetching your chats...\n")
        print("="*70)

        chat_count = 0

        async for dialog in app.get_dialogs():
            chat = dialog.chat
            chat_count += 1

            # Format chat type
            chat_type = chat.type.value if hasattr(chat.type, 'value') else str(chat.type)

            # Format username if available
            username = f"@{chat.username}" if chat.username else "No username"

            print(f"\nChat #{chat_count}:")
            print(f"  Title: {chat.title or 'N/A'}")
            print(f"  Type: {chat_type}")
            print(f"  Chat ID: {chat.id}")
            print(f"  Username: {username}")

            # Show first/last name for private chats
            if chat_type == "private":
                name = f"{chat.first_name or ''} {chat.last_name or ''}".strip()
                if name:
                    print(f"  Name: {name}")

        print("\n" + "="*70)
        print(f"✓ Found {chat_count} chats")
        print("="*70 + "\n")

        print("To use a chat ID in the backfill script:")
        print("  1. Copy the Chat ID from above (e.g., -1001234567890)")
        print("  2. Update CHAT_ID in telegram_holder_backfill.py")
        print("  3. For public groups, you can also use the username (e.g., '@groupname')\n")

    finally:
        await app.stop()


if __name__ == "__main__":
    # Validate configuration
    if API_ID == "YOUR_API_ID" or API_HASH == "YOUR_API_HASH":
        print("\nERROR: Please update API_ID and API_HASH in the configuration section.")
        print("Get your credentials from: https://my.telegram.org/apps\n")
    else:
        try:
            asyncio.run(list_all_chats())
        except KeyboardInterrupt:
            print("\n\nProcess interrupted by user. Exiting...")
        except Exception as e:
            print(f"\n\nError: {e}")
            import traceback
            traceback.print_exc()
