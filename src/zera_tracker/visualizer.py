"""
Visualizer - creates charts for unified ZERA price history
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Rectangle
from matplotlib.lines import Line2D
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict
import config
import os


def plot_candlesticks(ax, df, color='#4ECDC4', alpha=0.8):
    """
    Plot candlestick chart on given axes

    Args:
        ax: Matplotlib axes object
        df: DataFrame with columns: date, open, high, low, close
        color: Base color for candlesticks
        alpha: Transparency
    """
    # Calculate candlestick width based on data density
    if len(df) > 1:
        avg_timedelta = (df['date'].iloc[-1] - df['date'].iloc[0]) / len(df)
        candle_width = avg_timedelta * 0.6  # 60% of period for candle body
    else:
        candle_width = timedelta(days=0.6)

    for _, row in df.iterrows():
        date = row['date']
        open_price = row['open']
        high = row['high']
        low = row['low']
        close = row['close']

        # Determine if bullish (green) or bearish (red)
        is_bullish = close >= open_price
        body_color = '#26a69a' if is_bullish else '#ef5350'  # Green/Red

        # Draw high-low wick (thin line)
        ax.plot([date, date], [low, high],
                color=body_color, linewidth=1, alpha=alpha, zorder=1)

        # Draw body (rectangle from open to close)
        body_height = abs(close - open_price)
        body_bottom = min(open_price, close)

        if body_height > 0:
            rect = Rectangle((mdates.date2num(date) - candle_width.total_seconds()/(2*86400), body_bottom),
                           candle_width.total_seconds()/86400, body_height,
                           facecolor=body_color, edgecolor=body_color,
                           alpha=alpha, linewidth=0.5, zorder=2)
            ax.add_patch(rect)
        else:
            # Doji (open == close) - draw thin horizontal line
            ax.plot([mdates.date2num(date) - candle_width.total_seconds()/(2*86400),
                    mdates.date2num(date) + candle_width.total_seconds()/(2*86400)],
                   [close, close], color=body_color, linewidth=1.5, alpha=alpha, zorder=2)


def find_local_peaks(df: pd.DataFrame, window=5, prominence_threshold=0.1):
    """
    Find significant local peaks in the price data

    Args:
        df: DataFrame with 'high' and 'date' columns
        window: Window size for peak detection
        prominence_threshold: Relative prominence threshold (0-1)

    Returns:
        List of (date, high_price) tuples for peaks
    """
    if len(df) < window * 2:
        return []

    peaks = []
    highs = df['high'].values
    dates = df['date'].values

    # Calculate relative prominence threshold
    price_range = highs.max() - highs.min()
    min_prominence = price_range * prominence_threshold

    for i in range(window, len(highs) - window):
        # Check if current point is higher than neighbors
        is_peak = all(highs[i] >= highs[i-window:i]) and all(highs[i] >= highs[i+1:i+window+1])

        if is_peak:
            # Check prominence (how much higher than surrounding area)
            left_min = min(highs[max(0, i-window):i])
            right_min = min(highs[i+1:min(len(highs), i+window+1)])
            prominence = highs[i] - max(left_min, right_min)

            if prominence >= min_prominence:
                peaks.append((dates[i], highs[i]))

    return peaks


def find_local_troughs(df: pd.DataFrame, window=5, prominence_threshold=0.1):
    """
    Find significant local troughs (lows) in the price data

    Args:
        df: DataFrame with 'low' and 'date' columns
        window: Window size for trough detection
        prominence_threshold: Relative prominence threshold (0-1)

    Returns:
        List of (date, low_price) tuples for troughs
    """
    if len(df) < window * 2:
        return []

    troughs = []
    lows = df['low'].values
    dates = df['date'].values

    # Calculate relative prominence threshold
    price_range = lows.max() - lows.min()
    min_prominence = price_range * prominence_threshold

    for i in range(window, len(lows) - window):
        # Check if current point is lower than neighbors
        is_trough = all(lows[i] <= lows[i-window:i]) and all(lows[i] <= lows[i+1:i+window+1])

        if is_trough:
            # Check prominence (how much lower than surrounding area)
            left_max = max(lows[max(0, i-window):i])
            right_max = max(lows[i+1:min(len(lows), i+window+1)])
            prominence = min(left_max, right_max) - lows[i]

            if prominence >= min_prominence:
                troughs.append((dates[i], lows[i]))

    return troughs


def filter_by_minimum_distance(points, min_distance_days=5):
    """
    Filter points to ensure minimum distance between them
    Keeps the most prominent points when clustering occurs

    Args:
        points: List of (date, value) or (date, value, type) tuples
        min_distance_days: Minimum days between marked points

    Returns:
        Filtered list of tuples (same format as input)
    """
    if len(points) <= 1:
        return points

    # Sort by date
    sorted_points = sorted(points, key=lambda x: x[0])
    filtered = [sorted_points[0]]  # Always keep the first point

    for current_point in sorted_points[1:]:
        current_date = current_point[0]
        current_value = current_point[1]

        last_point = filtered[-1]
        last_date = last_point[0]
        last_value = last_point[1]

        # Convert timedelta to days (handles both numpy and pandas timedelta)
        time_diff = pd.Timedelta(current_date - last_date).total_seconds() / 86400

        if time_diff >= min_distance_days:
            # Far enough away, keep this point
            filtered.append(current_point)
        else:
            # Too close, keep the more extreme value (further from zero)
            if abs(current_value) > abs(last_value):
                filtered[-1] = current_point

    return filtered


def create_price_chart(df: pd.DataFrame, output_path: str = None, include_volume: bool = True):
    """
    Create a comprehensive price chart with migration markers

    Args:
        df: Unified DataFrame with price history
        output_path: Path to save the chart (optional)
        include_volume: Whether to include volume subplot (default: True)
    """
    # Calculate adaptive parameters based on timeframe
    real_df_temp = df[~df.get('is_interpolated', False)].copy()
    if len(real_df_temp) > 1:
        avg_time_delta = (real_df_temp['date'].iloc[-1] - real_df_temp['date'].iloc[0]) / len(real_df_temp)
        avg_hours = avg_time_delta.total_seconds() / 3600

        # Adaptive parameters based on timeframe
        if avg_hours < 1.5:  # Minute data
            label_offset_multiplier = 3
            min_distance_periods = 10
            peak_window = 3
        elif avg_hours < 12:  # Hourly data
            label_offset_multiplier = 4
            min_distance_periods = 6  # Reduced from 15 to allow more markers
            peak_window = 3  # Reduced from 5 for better detection
        else:  # Daily or longer
            label_offset_multiplier = 2
            min_distance_periods = 7
            peak_window = 5

        label_offset = avg_time_delta * label_offset_multiplier
        min_distance_hours = avg_hours * min_distance_periods
    else:
        # Fallback values
        label_offset = pd.Timedelta(hours=6)
        min_distance_hours = 24
        peak_window = 5

    # Set up dark theme style
    plt.style.use('dark_background')

    # Set up the figure - single plot if no volume, otherwise with volume subplot
    if include_volume:
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(16, 10),
                                         gridspec_kw={'height_ratios': [3, 1]})
        fig.patch.set_facecolor('#0d1117')
        ax1.set_facecolor('#0d1117')
        ax2.set_facecolor('#0d1117')
    else:
        # Larger single chart without volume
        fig, ax1 = plt.subplots(1, 1, figsize=(24, 12))
        fig.patch.set_facecolor('#0d1117')
        ax1.set_facecolor('#0d1117')

    # Add timeframe label to title
    timeframe_label = config.TIMEFRAME.upper()
    if config.TIMEFRAME == 'hour':
        timeframe_label = '1H'
    elif config.TIMEFRAME == 'day':
        timeframe_label = '1D'
    elif config.TIMEFRAME == 'minute':
        timeframe_label = '1M'

    fig.suptitle(f'ZERA Token - Complete Price History | {timeframe_label}',
                 fontsize=16, fontweight='bold', color='#c9d1d9')

    # Color mapping for different pools
    pool_colors = {
        'mon3y': '#FF6B6B',      # Red for M0N3Y
        'zera_Raydium': '#4ECDC4', # Teal for ZERA Raydium
        'zera_Meteora': '#45B7D1'  # Blue for ZERA Meteora
    }

    # Migration timestamps for filtering
    migration_1 = datetime.fromtimestamp(config.MIGRATION_DATES['mon3y_to_zera'])
    migration_2 = datetime.fromtimestamp(config.MIGRATION_DATES['zera_Raydium_to_Meteora'])

    # Plot 1: Candlestick chart
    # Plot each pool's real data as candlesticks
    real_df = df[~df.get('is_interpolated', False)].copy()

    # Track which pools were plotted for legend
    plotted_pools = []

    for pool_name in real_df['pool_name'].unique():
        pool_df = real_df[real_df['pool_name'] == pool_name].copy()

        # Cut off old pools BEFORE migration (new pools start AT migration)
        if pool_name == 'mon3y':
            # M0N3Y ends BEFORE ZERA Raydium starts (exclude migration date)
            pool_df = pool_df[pool_df['date'] < migration_1]
        elif pool_name == 'zera_Raydium':
            # ZERA Raydium starts at migration_1, ends BEFORE Meteora starts
            pool_df = pool_df[pool_df['date'] < migration_2]
        # Meteora has no cutoff (it's current, starts at migration_2)

        if len(pool_df) > 0:
            # Plot candlesticks for this pool
            plot_candlesticks(ax1, pool_df, color=pool_colors.get(pool_name, '#333333'), alpha=0.9)
            plotted_pools.append((pool_name, pool_colors.get(pool_name, '#333333')))

            # Find peaks and troughs using adaptive window
            peaks = find_local_peaks(pool_df, window=peak_window, prominence_threshold=0.25)
            troughs = find_local_troughs(pool_df, window=peak_window, prominence_threshold=0.25)

            # Combine peaks and troughs with type markers
            all_markers = []
            for date, value in peaks:
                all_markers.append((date, value, 'peak'))
            for date, value in troughs:
                all_markers.append((date, value, 'trough'))

            # Filter combined list to prevent overlaps using adaptive distance
            min_distance_days = min_distance_hours / 24
            filtered_markers = filter_by_minimum_distance(all_markers, min_distance_days=min_distance_days)

            # Plot filtered markers with side labels
            for marker in filtered_markers:
                date, value, marker_type = marker

                if marker_type == 'peak':
                    # Mark the peak with a small circle
                    ax1.plot(date, value, 'o', color='#26a69a', markersize=6,
                            markeredgecolor='white', markeredgewidth=1, zorder=11)

                    # Position label using adaptive offset
                    label_date = date + label_offset
                    ax1.annotate(f'${value:.4f}',
                               xy=(date, value),
                               xytext=(label_date, value),
                               fontsize=7, color='white', weight='bold',
                               bbox=dict(boxstyle='round,pad=0.4', facecolor='#26a69a',
                                        edgecolor='white', alpha=0.9, linewidth=1),
                               ha='left', va='center',
                               arrowprops=dict(arrowstyle='-', color='#26a69a',
                                             lw=1, alpha=0.6),
                               zorder=10)
                else:  # trough
                    # Mark the trough with a small circle
                    ax1.plot(date, value, 'o', color='#ef5350', markersize=6,
                            markeredgecolor='white', markeredgewidth=1, zorder=11)

                    # Position label using adaptive offset
                    label_date = date + label_offset
                    ax1.annotate(f'${value:.4f}',
                               xy=(date, value),
                               xytext=(label_date, value),
                               fontsize=7, color='white', weight='bold',
                               bbox=dict(boxstyle='round,pad=0.4', facecolor='#ef5350',
                                        edgecolor='white', alpha=0.9, linewidth=1),
                               ha='left', va='center',
                               arrowprops=dict(arrowstyle='-', color='#ef5350',
                                             lw=1, alpha=0.6),
                               zorder=10)

    # Label the absolute last candlestick (current price) - only once
    last_row = real_df.iloc[-1]
    last_date = last_row['date']
    last_close = last_row['close']
    last_high = last_row['high']
    last_low = last_row['low']

    # Determine which value to mark (high or low based on close position)
    candle_range = last_high - last_low
    if candle_range > 0:
        close_position = (last_close - last_low) / candle_range
        if close_position > 0.7:  # Close near high
            mark_value = last_high
            mark_color = '#26a69a'  # Green
        elif close_position < 0.3:  # Close near low
            mark_value = last_low
            mark_color = '#ef5350'  # Red
        else:  # Close in middle
            mark_value = last_close
            mark_color = '#4169E1'  # Blue
    else:
        mark_value = last_close
        mark_color = '#4169E1'

    # Mark with circle
    ax1.plot(last_date, mark_value, 'o', color=mark_color, markersize=8,
            markeredgecolor='white', markeredgewidth=1.5, zorder=12)

    # Position label using adaptive offset
    label_date = last_date + label_offset
    ax1.annotate(f'${mark_value:.4f}',
               xy=(last_date, mark_value),
               xytext=(label_date, mark_value),
               fontsize=8, color='white', weight='bold',
               bbox=dict(boxstyle='round,pad=0.5', facecolor=mark_color,
                        edgecolor='white', alpha=1.0, linewidth=1.5),
               ha='left', va='center',
               arrowprops=dict(arrowstyle='-', color=mark_color,
                             lw=1.5, alpha=0.8),
               zorder=12)

    # Add migration markers with transition labels
    for event_name, timestamp in config.MIGRATION_DATES.items():
        migration_date = datetime.fromtimestamp(timestamp)
        ax1.axvline(x=migration_date, color='#666666', linestyle='--',
                   linewidth=1, alpha=0.6, zorder=0)

        # Create transition label from event name
        if 'mon3y_to_zera' in event_name:
            label = 'MON3Y → Raydium'
        elif 'Raydium_to_Meteora' in event_name:
            label = 'Raydium → Meteora'
        else:
            label = event_name.replace('_', ' → ')

        # Place label at top of chart, centered on line
        ax1.text(migration_date, ax1.get_ylim()[1] * 0.98, label,
                ha='center', va='top', fontsize=8, color='#8b949e',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='#161b22',
                         edgecolor='#52C97D', alpha=0.9, linewidth=0.5))

    # Create custom legend with simple names
    legend_elements = []

    # Simple label mapping
    simple_labels = {
        'mon3y': 'MON3Y',
        'zera_Raydium': 'Raydium',
        'zera_Meteora': 'Meteora'
    }

    # Add legend entries for each plotted pool
    for pool_name, color in plotted_pools:
        label = simple_labels.get(pool_name, pool_name)
        legend_elements.append(Line2D([0], [0], color=color, linewidth=8,
                                     label=label))

    ax1.set_xlabel('Date', fontsize=12, color='#c9d1d9')
    ax1.set_ylabel('Price (USD)', fontsize=12, color='#c9d1d9')
    ax1.set_title('OHLC Candlestick Chart', fontsize=14, color='#c9d1d9')
    ax1.legend(handles=legend_elements, loc='upper left', fontsize=10,
              facecolor='#161b22', edgecolor='#52C97D', labelcolor='#c9d1d9')
    ax1.grid(True, alpha=0.15, color='#52C97D', linestyle='-', linewidth=0.5)
    ax1.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    ax1.tick_params(colors='#8b949e', which='both')
    plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

    # Set x-axis limits with padding to ensure all data fits (including labels)
    date_range = real_df['date'].max() - real_df['date'].min()
    left_padding = date_range * 0.02  # 2% padding on left
    # Right padding needs to account for label offset plus some extra space
    right_padding = label_offset + (date_range * 0.05)
    ax1.set_xlim(real_df['date'].min() - left_padding, real_df['date'].max() + right_padding)

    # Plot 2: Volume over time (only if include_volume is True)
    if include_volume:
        # Only plot real data (skip interpolated points)
        real_df_vol = df[~df.get('is_interpolated', False)].copy()

        for pool_name in real_df_vol['pool_name'].unique():
            pool_df = real_df_vol[real_df_vol['pool_name'] == pool_name].copy()

            # Cut off old pools BEFORE migration (new pools start AT migration)
            if pool_name == 'mon3y':
                pool_df = pool_df[pool_df['date'] < migration_1]
            elif pool_name == 'zera_Raydium':
                pool_df = pool_df[pool_df['date'] < migration_2]

            if len(pool_df) > 0:
                label = simple_labels.get(pool_name, pool_name)
                # Scale volume to millions
                ax2.bar(pool_df['date'], pool_df['volume'] / 1_000_000,
                       label=label,
                       color=pool_colors.get(pool_name, '#333333'),
                       alpha=0.6, width=0.8)

        # Add migration markers to volume chart (matching price chart style)
        for event_name, timestamp in config.MIGRATION_DATES.items():
            migration_date = datetime.fromtimestamp(timestamp)
            ax2.axvline(x=migration_date, color='#52C97D', linestyle='--',
                       linewidth=1, alpha=0.6, zorder=0)

        ax2.set_xlabel('Date', fontsize=12, color='#c9d1d9')
        ax2.set_ylabel('Volume (Millions USD)', fontsize=12, color='#c9d1d9')
        ax2.set_title('Trading Volume Over Time', fontsize=14, color='#c9d1d9')
        ax2.grid(True, alpha=0.15, color='#52C97D', linestyle='-', linewidth=0.5, axis='y')
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
        ax2.tick_params(colors='#8b949e', which='both')
        plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')

        # Set x-axis limits to match price chart exactly
        ax2.set_xlim(real_df['date'].min() - left_padding, real_df['date'].max() + right_padding)

    plt.tight_layout()

    # Save or show
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"\n✓ Chart saved to: {output_path}")
    else:
        plt.show()

    plt.close()


def create_comparison_chart(df: pd.DataFrame, output_path: str = None):
    """
    Create a comparison chart showing key metrics across pools

    Args:
        df: Unified DataFrame with price history
        output_path: Path to save the chart (optional)
    """
    # Set up dark theme
    plt.style.use('dark_background')

    # Filter out interpolated data for accurate statistics
    real_df = df[~df.get('is_interpolated', False)].copy()

    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(14, 10))
    fig.patch.set_facecolor('#0d1117')
    for ax in [ax1, ax2, ax3, ax4]:
        ax.set_facecolor('#0d1117')

    fig.suptitle('ZERA Token - Pool Comparison Metrics',
                 fontsize=16, fontweight='bold', color='#c9d1d9')

    pool_colors = ['#FF6B6B', '#4ECDC4', '#45B7D1']

    # Simple label mapping
    simple_labels = {
        'mon3y': 'MON3Y',
        'zera_Raydium': 'Raydium',
        'zera_Meteora': 'Meteora'
    }

    # 1. Average Price by Pool
    avg_prices = real_df.groupby('pool_name')['close'].mean()
    ax1.bar(range(len(avg_prices)), avg_prices.values, color=pool_colors)
    ax1.set_xticks(range(len(avg_prices)))
    ax1.set_xticklabels([simple_labels.get(p, p) for p in avg_prices.index],
                         rotation=15, ha='right', color='#c9d1d9')
    ax1.set_ylabel('Average Price (USD)', color='#c9d1d9')
    ax1.set_title('Average Price by Pool', color='#c9d1d9')
    ax1.grid(True, alpha=0.15, axis='y', color='#52C97D', linewidth=0.5)
    ax1.tick_params(colors='#8b949e', which='both')

    # 2. Total Volume by Pool
    total_volumes = real_df.groupby('pool_name')['volume'].sum()
    ax2.bar(range(len(total_volumes)), total_volumes.values, color=pool_colors)
    ax2.set_xticks(range(len(total_volumes)))
    ax2.set_xticklabels([simple_labels.get(p, p) for p in total_volumes.index],
                         rotation=15, ha='right', color='#c9d1d9')
    ax2.set_ylabel('Total Volume (USD)', color='#c9d1d9')
    ax2.set_title('Total Volume by Pool', color='#c9d1d9')
    ax2.grid(True, alpha=0.15, axis='y', color='#52C97D', linewidth=0.5)
    ax2.tick_params(colors='#8b949e', which='both')

    # 3. Price Volatility (std dev) by Pool
    volatility = real_df.groupby('pool_name')['close'].std()
    ax3.bar(range(len(volatility)), volatility.values, color=pool_colors)
    ax3.set_xticks(range(len(volatility)))
    ax3.set_xticklabels([simple_labels.get(p, p) for p in volatility.index],
                         rotation=15, ha='right', color='#c9d1d9')
    ax3.set_ylabel('Price Std Dev (USD)', color='#c9d1d9')
    ax3.set_title('Price Volatility by Pool', color='#c9d1d9')
    ax3.grid(True, alpha=0.15, axis='y', color='#52C97D', linewidth=0.5)
    ax3.tick_params(colors='#8b949e', which='both')

    # 4. Days Active by Pool
    days_active = real_df.groupby('pool_name').size()
    ax4.bar(range(len(days_active)), days_active.values, color=pool_colors)
    ax4.set_xticks(range(len(days_active)))
    ax4.set_xticklabels([simple_labels.get(p, p) for p in days_active.index],
                         rotation=15, ha='right', color='#c9d1d9')
    ax4.set_ylabel('Days', color='#c9d1d9')
    ax4.set_title('Days Active by Pool', color='#c9d1d9')
    ax4.grid(True, alpha=0.15, axis='y', color='#52C97D', linewidth=0.5)
    ax4.tick_params(colors='#8b949e', which='both')

    plt.tight_layout()

    # Save or show
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"✓ Comparison chart saved to: {output_path}")
    else:
        plt.show()

    plt.close()


if __name__ == "__main__":
    # Test the visualizer
    from fetcher import fetch_all_pools
    from consolidator import create_unified_dataframe, add_migration_markers

    print("Testing visualizer...")
    all_data = fetch_all_pools()
    df = create_unified_dataframe(all_data)
    df = add_migration_markers(df)

    # Create charts
    create_price_chart(df, f"{config.OUTPUT_DIR}/{config.CHART_FILENAME}")
    create_comparison_chart(df, f"{config.OUTPUT_DIR}/zera_comparison_chart.png")
