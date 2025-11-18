#!/usr/bin/env python3
"""
Process Holder Data - Convert JSON backfill data to CSV

This script takes the holder_backfill_data.json file created by the Telegram
backfill script and converts it into a clean CSV format for analysis or database import.

Usage:
    python process_holder_data.py
"""

import json
import csv
from datetime import datetime
from pathlib import Path

# Input and output files
INPUT_FILE = "output/holder_backfill_data.json"
OUTPUT_CSV = "output/holder_history.csv"
OUTPUT_SUMMARY = "output/holder_summary.txt"


def load_holder_data(input_file: str) -> list:
    """Load holder data from JSON file"""
    with open(input_file, 'r') as f:
        data = json.load(f)
    return data['data']


def export_to_csv(holder_data: list, output_file: str):
    """Export holder data to CSV"""
    # Ensure output directory exists
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)

        # Write header
        writer.writerow(['date', 'timestamp', 'holder_count', 'message_id'])

        # Write data rows
        for entry in holder_data:
            writer.writerow([
                entry['date'],
                entry['timestamp'],
                entry['holder_count'],
                entry['message_id']
            ])

    print(f"✓ CSV exported to: {output_file}")


def generate_summary(holder_data: list, output_file: str):
    """Generate a summary report of the holder data"""
    if not holder_data:
        print("No data to summarize")
        return

    # Calculate statistics
    holder_counts = [d['holder_count'] for d in holder_data]
    min_holders = min(holder_counts)
    max_holders = max(holder_counts)
    avg_holders = sum(holder_counts) / len(holder_counts)

    # Find growth
    first_count = holder_data[0]['holder_count']
    last_count = holder_data[-1]['holder_count']
    growth = last_count - first_count
    growth_pct = (growth / first_count * 100) if first_count > 0 else 0

    # Time period
    start_date = datetime.fromisoformat(holder_data[0]['date'])
    end_date = datetime.fromisoformat(holder_data[-1]['date'])
    days = (end_date - start_date).days

    # Generate summary text
    summary = f"""
{'='*70}
HOLDER DATA SUMMARY
{'='*70}

Data Collection Period:
  Start: {start_date.strftime('%Y-%m-%d %H:%M:%S')}
  End:   {end_date.strftime('%Y-%m-%d %H:%M:%S')}
  Duration: {days} days

Holder Statistics:
  Total data points: {len(holder_data)}
  Minimum holders: {min_holders:,}
  Maximum holders: {max_holders:,}
  Average holders: {avg_holders:,.0f}

Growth Analysis:
  Starting holders: {first_count:,}
  Ending holders: {last_count:,}
  Net change: {growth:+,}
  Percentage change: {growth_pct:+.2f}%

Recent Activity (Last 10 entries):
"""

    for entry in holder_data[-10:]:
        date = datetime.fromisoformat(entry['date'])
        summary += f"  {date.strftime('%Y-%m-%d %H:%M')}: {entry['holder_count']:,} holders\n"

    summary += f"\n{'='*70}\n"

    # Write to file
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w') as f:
        f.write(summary)

    # Also print to console
    print(summary)
    print(f"✓ Summary saved to: {output_file}")


def find_significant_events(holder_data: list, threshold: int = 100):
    """Find significant holder count changes"""
    print(f"\nSignificant Events (changes > {threshold} holders):")
    print("="*70)

    for i in range(1, len(holder_data)):
        prev = holder_data[i-1]
        curr = holder_data[i]

        change = curr['holder_count'] - prev['holder_count']

        if abs(change) > threshold:
            date = datetime.fromisoformat(curr['date'])
            direction = "📈 Increase" if change > 0 else "📉 Decrease"
            print(f"\n{date.strftime('%Y-%m-%d %H:%M')}")
            print(f"  {direction}: {prev['holder_count']:,} → {curr['holder_count']:,} ({change:+,})")


def main():
    """Main execution"""
    print("\n" + "="*70)
    print("HOLDER DATA PROCESSOR")
    print("="*70 + "\n")

    try:
        # Load data
        print(f"Loading data from: {INPUT_FILE}")
        holder_data = load_holder_data(INPUT_FILE)
        print(f"✓ Loaded {len(holder_data)} records\n")

        # Export to CSV
        export_to_csv(holder_data, OUTPUT_CSV)
        print(f"  Total rows: {len(holder_data)}")

        # Generate summary
        generate_summary(holder_data, OUTPUT_SUMMARY)

        # Find significant events
        find_significant_events(holder_data, threshold=100)

        print("\n" + "="*70)
        print("PROCESSING COMPLETE")
        print("="*70)
        print(f"\nGenerated files:")
        print(f"  📊 {OUTPUT_CSV}")
        print(f"  📄 {OUTPUT_SUMMARY}")
        print("\n" + "="*70 + "\n")

    except FileNotFoundError:
        print(f"✗ Error: Could not find {INPUT_FILE}")
        print("  Please run telegram_holder_backfill.py first to generate the data.")
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nProcess interrupted by user. Exiting...")
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
