#!/usr/bin/env python3
"""
Token Migration Tracker - Main Orchestration Script

This script tracks token price history across pool migrations and transitions.
Currently configured for ZERA token, but can be adapted for any token migration.

This script:
1. Fetches historical price data from GeckoTerminal for all configured pools
2. Consolidates the data into a unified timeline with migration handling
3. Generates visualizations and exports data to CSV

Configure pool addresses and migration dates in config.py to track different tokens.
"""

import os
import sys
import argparse
from datetime import datetime

# Import our modules
import config
from src.zera_tracker import (
    fetch_all_pools,
    create_unified_dataframe,
    interpolate_migration_gaps,
    add_migration_markers,
    get_summary_stats,
    print_summary,
    create_price_chart,
    create_comparison_chart
)


def main(use_cache: bool = False):
    """Main execution function"""
    print("="*70)
    print("TOKEN MIGRATION TRACKER")
    print("="*70)
    print(f"\nStarting data collection at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nThis tool tracks complete price history across pool migrations.")
    print(f"Currently configured for: {config.CSV_FILENAME.replace('_unified_price_history.csv', '').upper()}\n")

    # Step 1: Fetch data from GeckoTerminal API (or load from cache)
    if use_cache:
        print("\n[1/5] Loading data from cache...")
    else:
        print("\n[1/5] Fetching data from GeckoTerminal API...")
    print("-" * 70)
    try:
        all_pool_data = fetch_all_pools(use_cache=use_cache)
        print("\n✓ Data fetching completed")
    except Exception as e:
        print(f"\n✗ Error fetching data: {e}")
        sys.exit(1)

    # Step 2: Consolidate data
    print("\n[2/5] Consolidating data from all pools...")
    print("-" * 70)
    try:
        df = create_unified_dataframe(all_pool_data)
        df = interpolate_migration_gaps(df)
        df = add_migration_markers(df)
        print("✓ Data consolidation completed")
    except Exception as e:
        print(f"\n✗ Error consolidating data: {e}")
        sys.exit(1)

    # Step 3: Generate summary statistics
    print("\n[3/5] Calculating summary statistics...")
    print("-" * 70)
    try:
        stats = get_summary_stats(df)
        print_summary(stats)
    except Exception as e:
        print(f"\n✗ Error calculating stats: {e}")
        sys.exit(1)

    # Step 4: Export data to CSV
    print("\n[4/5] Exporting data to CSV...")
    print("-" * 70)
    try:
        os.makedirs(config.OUTPUT_DIR, exist_ok=True)
        csv_path = f"{config.OUTPUT_DIR}/{config.CSV_FILENAME}"
        df.to_csv(csv_path, index=False)
        print(f"✓ Data exported to: {csv_path}")
        print(f"  Total rows: {len(df)}")
        print(f"  Columns: {', '.join(df.columns)}")
    except Exception as e:
        print(f"\n✗ Error exporting CSV: {e}")

    # Step 5: Generate visualizations
    print("\n[5/5] Generating visualizations...")
    print("-" * 70)

    # Define paths before try block
    chart_path = f"{config.OUTPUT_DIR}/{config.CHART_FILENAME}"
    chart_price_only_path = f"{config.OUTPUT_DIR}/zera_price_chart_large.png"
    comparison_path = f"{config.OUTPUT_DIR}/zera_comparison_chart.png"

    try:
        # Main price chart with volume
        create_price_chart(df, chart_path, include_volume=True)

        # Large price chart without volume
        create_price_chart(df, chart_price_only_path, include_volume=False)

        # Comparison chart
        create_comparison_chart(df, comparison_path)

        print("✓ Visualizations completed")
    except Exception as e:
        print(f"\n✗ Error generating charts: {e}")
        import traceback
        traceback.print_exc()

    # Final summary
    print("\n" + "="*70)
    print("COMPLETION SUMMARY")
    print("="*70)
    print(f"\n✓ Successfully tracked {len(df)} days of price history")
    print(f"✓ From: {stats['start_date']}")
    print(f"✓ To:   {stats['end_date']}")
    print(f"\nGenerated files:")
    print(f"  📊 {csv_path}")
    print(f"  📈 {chart_path}")
    print(f"  📈 {chart_price_only_path} (large, price only)")
    print(f"  📊 {comparison_path}")
    print("\n" + "="*70)
    print(f"Completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70 + "\n")


if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description='Token Migration Tracker - Track token prices across pool migrations and transitions'
    )
    parser.add_argument('--cache', action='store_true',
                       help='Use cached API data instead of fetching from GeckoTerminal')
    args = parser.parse_args()

    try:
        main(use_cache=args.cache)
    except KeyboardInterrupt:
        print("\n\nProcess interrupted by user. Exiting...")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
