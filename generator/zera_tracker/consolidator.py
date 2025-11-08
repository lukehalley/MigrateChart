"""
Data consolidator - merges M0N3Y and ZERA pool data into unified timeline
"""

import pandas as pd
from datetime import datetime
from typing import Dict, List
import config
from .fetcher import parse_ohlcv_data


def create_unified_dataframe(all_pool_data: Dict) -> pd.DataFrame:
    """
    Consolidate data from all pools into a single unified DataFrame

    Args:
        all_pool_data: Dictionary of pool data from fetcher

    Returns:
        Unified pandas DataFrame with complete price history
    """
    all_records = []

    # Process each pool
    for pool_name, pool_data in all_pool_data.items():
        if not pool_data.get('data'):
            print(f"Warning: No data for {pool_name}")
            continue

        pool_info = pool_data['info']
        ohlcv_list = parse_ohlcv_data(pool_data['data'])

        for entry in ohlcv_list:
            record = {
                'timestamp': entry['timestamp'],
                'date': datetime.fromtimestamp(entry['timestamp']),
                'open': entry['open'],
                'high': entry['high'],
                'low': entry['low'],
                'close': entry['close'],
                'volume': entry['volume'],
                'pool_name': pool_name,
                'pool_address': pool_info['address'],
                'token_symbol': pool_info['token_symbol']
            }
            all_records.append(record)

    # Create DataFrame
    df = pd.DataFrame(all_records)

    # Sort by timestamp
    df = df.sort_values('timestamp').reset_index(drop=True)

    # Add calculated fields
    df['price_change'] = df['close'] - df['open']
    df['price_change_pct'] = (df['price_change'] / df['open']) * 100

    print(f"\nConsolidated {len(df)} total data points across all pools")
    print(f"Date range: {df['date'].min()} to {df['date'].max()}")

    return df


def interpolate_migration_gaps(df: pd.DataFrame, hours_per_point: int = 6) -> pd.DataFrame:
    """
    Interpolate missing data between pool migrations for smooth transitions

    For daily data, this adds multiple interpolation points per day to create
    smooth visual transitions in charts.

    Args:
        df: Unified DataFrame
        hours_per_point: Hours between interpolated points (default: 6 = 4 points/day)

    Returns:
        DataFrame with interpolated values at migration points
    """
    import numpy as np

    # Sort by timestamp
    df = df.sort_values('timestamp').reset_index(drop=True)

    # Add 'is_interpolated' flag to existing data
    df['is_interpolated'] = False

    # For each migration, check if there's a gap and interpolate
    for event_name, migration_ts in config.MIGRATION_DATES.items():
        # Only look at real data (not previously interpolated points) when finding gaps
        real_data = df[df['is_interpolated'] == False].copy()

        # Find data points around migration
        before_mask = real_data['timestamp'] < migration_ts
        after_mask = real_data['timestamp'] >= migration_ts

        if before_mask.any() and after_mask.any():
            last_before = real_data[before_mask].iloc[-1]
            first_after = real_data[after_mask].iloc[0]

            # Calculate time gap in hours
            time_gap_hours = (first_after['timestamp'] - last_before['timestamp']) / 3600
            time_gap_seconds = first_after['timestamp'] - last_before['timestamp']

            # If gap is > hours_per_point, interpolate
            if time_gap_hours > hours_per_point:
                print(f"  Interpolating {time_gap_hours:.1f}h gap at {event_name}")

                # Create interpolated points at regular intervals
                num_points = int(time_gap_hours / hours_per_point)
                interval_seconds = hours_per_point * 3600

                for i in range(1, num_points + 1):
                    ratio = (i * interval_seconds) / time_gap_seconds
                    interp_ts = last_before['timestamp'] + (i * interval_seconds)

                    # Linear interpolation of price
                    interp_price = last_before['close'] + ratio * (first_after['close'] - last_before['close'])

                    # Interpolate volume as well (gradually taper to 0 at midpoint, then back up)
                    volume_ratio = 1 - (2 * abs(ratio - 0.5))  # Creates a valley at midpoint
                    interp_volume = (last_before['volume'] + first_after['volume']) * volume_ratio * 0.3

                    new_row = {
                        'timestamp': int(interp_ts),
                        'date': datetime.fromtimestamp(interp_ts),
                        'open': interp_price,
                        'high': interp_price * 1.001,  # Add slight variation
                        'low': interp_price * 0.999,
                        'close': interp_price,
                        'volume': interp_volume,
                        'pool_name': f'{last_before["pool_name"]}_to_{first_after["pool_name"]}',
                        'pool_address': last_before['pool_address'],
                        'token_symbol': last_before['token_symbol'],
                        'price_change': 0,
                        'price_change_pct': 0,
                        'is_interpolated': True
                    }

                    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

                print(f"    Added {num_points} interpolated points ({hours_per_point}h intervals)")

    # Re-sort after adding interpolated points
    df = df.sort_values('timestamp').reset_index(drop=True)

    return df


def add_migration_markers(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add migration event markers to the DataFrame

    Args:
        df: Unified DataFrame

    Returns:
        DataFrame with migration marker column
    """
    df['migration_event'] = None

    # Mark migration dates
    for event_name, timestamp in config.MIGRATION_DATES.items():
        migration_date = datetime.fromtimestamp(timestamp).date()
        mask = df['date'].dt.date == migration_date
        df.loc[mask, 'migration_event'] = event_name.replace('_', ' ').title()

    return df


def get_summary_stats(df: pd.DataFrame) -> Dict:
    """
    Calculate summary statistics for the unified price history

    Args:
        df: Unified DataFrame

    Returns:
        Dictionary of summary statistics
    """
    stats = {
        'total_days': len(df),
        'start_date': df['date'].min(),
        'end_date': df['date'].max(),
        'start_price': df.iloc[0]['close'],
        'end_price': df.iloc[-1]['close'],
        'total_change': df.iloc[-1]['close'] - df.iloc[0]['close'],
        'total_change_pct': ((df.iloc[-1]['close'] - df.iloc[0]['close']) / df.iloc[0]['close']) * 100,
        'highest_price': df['high'].max(),
        'lowest_price': df['low'].min(),
        'total_volume': df['volume'].sum(),
        'avg_daily_volume': df['volume'].mean(),
        'pools': {
            'mon3y': len(df[df['pool_name'] == 'mon3y']),
            'zera_Raydium': len(df[df['pool_name'] == 'zera_Raydium']),
            'zera_Meteora': len(df[df['pool_name'] == 'zera_Meteora'])
        }
    }

    return stats


def print_summary(stats: Dict):
    """Print summary statistics in a readable format"""
    print("\n" + "="*60)
    print("ZERA UNIFIED PRICE HISTORY SUMMARY")
    print("="*60)
    print(f"\nDate Range: {stats['start_date']} to {stats['end_date']}")
    print(f"Total Days: {stats['total_days']}")
    print(f"\nPrice Journey:")
    print(f"  Start Price: ${stats['start_price']:.8f}")
    print(f"  End Price:   ${stats['end_price']:.8f}")
    print(f"  Change:      ${stats['total_change']:.8f} ({stats['total_change_pct']:.2f}%)")
    print(f"\nPrice Range:")
    print(f"  Highest: ${stats['highest_price']:.8f}")
    print(f"  Lowest:  ${stats['lowest_price']:.8f}")
    print(f"\nVolume:")
    print(f"  Total:   ${stats['total_volume']:.2f}")
    print(f"  Avg/Day: ${stats['avg_daily_volume']:.2f}")
    print(f"\nData Points per Pool:")
    for pool, count in stats['pools'].items():
        print(f"  {pool}: {count} days")
    print("="*60 + "\n")


if __name__ == "__main__":
    # Test the consolidator
    from fetcher import fetch_all_pools

    print("Testing data consolidator...")
    all_data = fetch_all_pools()
    df = create_unified_dataframe(all_data)
    df = add_migration_markers(df)

    stats = get_summary_stats(df)
    print_summary(stats)

    print(f"\nFirst 5 rows:")
    print(df.head())
    print(f"\nLast 5 rows:")
    print(df.tail())
