#!/usr/bin/env python3
"""
Telegram Holder Data Backfill Script

This script uses Pyrogram to fetch historical messages from a Telegram group chat,
specifically looking for messages from "Skeleton Price Bot" that contain holder counts.
It extracts the holder data and timestamps for backfilling the database.

Setup:
1. Install dependencies: pip install -r requirements.txt
2. Get your API credentials from https://my.telegram.org/apps
3. Copy .env.example to .env and add your credentials
4. Run the script: python telegram_holder_backfill.py
"""

import os
import re
import json
import asyncio
import sys
from datetime import datetime
from typing import List, Dict
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
from pyrogram.types import Message

# ============================================================================
# CONFIGURATION - Loaded from .env file
# ============================================================================

# Get your API credentials from https://my.telegram.org/apps
API_ID = int(os.getenv('TELEGRAM_API_ID'))
API_HASH = os.getenv('TELEGRAM_API_HASH')

# The chat/group where the bot posts holder counts
CHAT_ID = int(os.getenv('TELEGRAM_CHAT_ID'))

# Bot name to filter messages from
BOT_NAME = os.getenv('TELEGRAM_BOT_NAME', 'Skeleton Price Bot')

# Pattern to extract holder count from messages
# Matches "Holders of ZERA token: 4704"
HOLDER_PATTERN = r"Holders of ZERA token:\s*(\d+)"

# Output file for the extracted data
OUTPUT_FILE = "output/holder_backfill_data.json"

# Session name (will create a session file)
SESSION_NAME = "zera_telegram_session"

# ============================================================================
# CODE - No need to modify below this line
# ============================================================================


class HolderDataExtractor:
    """Extracts holder count data from Telegram messages"""

    def __init__(self, api_id: str, api_hash: str, session_name: str = SESSION_NAME):
        """
        Initialize the Telegram client

        Args:
            api_id: Telegram API ID
            api_hash: Telegram API Hash
            session_name: Name for the session file
        """
        self.api_id = api_id
        self.api_hash = api_hash
        self.app = Client(session_name, api_id=api_id, api_hash=api_hash)
        self.holder_data: List[Dict] = []

    def extract_holder_count(self, text: str) -> int | None:
        """
        Extract holder count from message text

        Args:
            text: Message text to parse

        Returns:
            Holder count as integer, or None if not found
        """
        match = re.search(HOLDER_PATTERN, text)
        if match:
            return int(match.group(1))
        return None

    async def fetch_holder_messages(self, chat_id: str | int, bot_name: str = BOT_NAME):
        """
        Fetch all messages from the bot containing holder counts

        Args:
            chat_id: Chat ID or username to search
            bot_name: Name of the bot to filter messages from
        """
        from datetime import datetime as dt

        print(f"\n{'='*70}")
        print("TELEGRAM HOLDER DATA BACKFILL")
        print(f"{'='*70}\n")
        print(f"Starting message fetch from chat: {chat_id}")
        print(f"Looking for messages from: {bot_name}")
        print(f"Pattern: {HOLDER_PATTERN}")
        print(f"Starting from: January 1, 2025\n")
        print("This may take a while depending on chat history size...\n")

        message_count = 0
        holder_count_messages = 0

        # Start date: January 1, 2025
        start_date = dt(2025, 1, 1)

        # Use iter_history to get all messages from start of 2025
        async for message in self.app.get_chat_history(
            chat_id=chat_id,
            limit=0  # No limit, get all messages
        ):
            # Stop if we reach messages before 2025
            if message.date < start_date:
                break

            message_count += 1

            # Filter by bot sender if message has sender info
            if message.from_user:
                sender_name = f"{message.from_user.first_name or ''} {message.from_user.last_name or ''}".strip()
                if sender_name != bot_name:
                    continue

            # Extract holder count
            if message.text:
                holder_count = self.extract_holder_count(message.text)
                if holder_count is not None:
                    holder_count_messages += 1
                    data_point = {
                        "message_id": message.id,
                        "date": message.date.isoformat(),
                        "timestamp": int(message.date.timestamp()),
                        "holder_count": holder_count,
                        "text": message.text,
                    }
                    self.holder_data.append(data_point)

                    # Print progress every 10 messages
                    if holder_count_messages % 10 == 0:
                        print(f"  Found {holder_count_messages} holder count messages...")

            # Print overall progress every 1000 messages
            if message_count % 1000 == 0:
                print(f"  Scanned {message_count} total messages...")

        print(f"\n{'='*70}")
        print(f"✓ Completed message search")
        print(f"  Total messages searched: {message_count}")
        print(f"  Holder count messages found: {holder_count_messages}")
        print(f"{'='*70}\n")

    def save_data(self, output_file: str = OUTPUT_FILE):
        """
        Save extracted holder data to JSON file

        Args:
            output_file: Path to output file
        """
        # Sort by timestamp (oldest first)
        self.holder_data.sort(key=lambda x: x["timestamp"])

        # Create output directory if needed
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        # Save to JSON
        output = {
            "extracted_at": datetime.now().isoformat(),
            "total_records": len(self.holder_data),
            "date_range": {
                "start": self.holder_data[0]["date"] if self.holder_data else None,
                "end": self.holder_data[-1]["date"] if self.holder_data else None,
            },
            "data": self.holder_data,
        }

        with open(output_file, "w") as f:
            json.dump(output, f, indent=2)

        print(f"✓ Data saved to: {output_file}")
        print(f"  Total records: {len(self.holder_data)}")
        if self.holder_data:
            print(f"  Date range: {self.holder_data[0]['date']} to {self.holder_data[-1]['date']}")
            print(f"  Holder count range: {min(d['holder_count'] for d in self.holder_data)} to {max(d['holder_count'] for d in self.holder_data)}")

    def print_summary(self):
        """Print summary statistics of extracted data"""
        if not self.holder_data:
            print("No holder data extracted.")
            return

        print(f"\n{'='*70}")
        print("DATA SUMMARY")
        print(f"{'='*70}\n")

        print(f"Total data points: {len(self.holder_data)}")
        print(f"Date range: {self.holder_data[0]['date']} to {self.holder_data[-1]['date']}")
        print(f"Holder count range: {min(d['holder_count'] for d in self.holder_data)} to {max(d['holder_count'] for d in self.holder_data)}")

        # Show first and last few entries
        print("\nFirst 3 entries:")
        for entry in self.holder_data[:3]:
            print(f"  {entry['date']}: {entry['holder_count']} holders")

        print("\nLast 3 entries:")
        for entry in self.holder_data[-3:]:
            print(f"  {entry['date']}: {entry['holder_count']} holders")


async def main():
    """Main execution function"""
    # Validate configuration
    if API_ID == "YOUR_API_ID" or API_HASH == "YOUR_API_HASH":
        print("ERROR: Please update API_ID and API_HASH in the configuration section.")
        print("Get your credentials from: https://my.telegram.org/apps")
        return

    if CHAT_ID == "YOUR_CHAT_ID_OR_USERNAME":
        print("ERROR: Please update CHAT_ID in the configuration section.")
        print("This should be the chat/group where the bot posts holder counts.")
        return

    # Create extractor
    extractor = HolderDataExtractor(api_id=API_ID, api_hash=API_HASH)

    try:
        # Start the client (will prompt for phone number and verification code on first run)
        await extractor.app.start()
        print("✓ Successfully connected to Telegram\n")

        # Get chat info first to ensure it's cached in the session
        try:
            chat = await extractor.app.get_chat(CHAT_ID)
            print(f"✓ Found chat: {chat.title}")
            print(f"  Type: {chat.type}")
            print(f"  Members: {chat.members_count if hasattr(chat, 'members_count') else 'N/A'}\n")
        except Exception as e:
            print(f"✗ Could not access chat {CHAT_ID}: {e}")
            print("  Make sure you're a member of this chat.\n")
            return

        # Fetch holder messages
        await extractor.fetch_holder_messages(chat_id=CHAT_ID, bot_name=BOT_NAME)

        # Save and display results
        extractor.save_data(output_file=OUTPUT_FILE)
        extractor.print_summary()

    finally:
        # Stop the client
        await extractor.app.stop()
        print(f"\n{'='*70}")
        print("Session ended")
        print(f"{'='*70}\n")


if __name__ == "__main__":
    import asyncio
    import sys

    # Fix for Python 3.14+ event loop compatibility
    if sys.version_info >= (3, 10):
        try:
            asyncio.get_event_loop()
        except RuntimeError:
            asyncio.set_event_loop(asyncio.new_event_loop())

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nProcess interrupted by user. Exiting...")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
