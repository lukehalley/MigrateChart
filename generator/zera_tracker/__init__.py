"""
ZERA Price Tracker

A tool for tracking historical price data for ZERA token across different pools.
"""

__version__ = "1.0.0"

from .fetcher import fetch_all_pools
from .consolidator import (
    create_unified_dataframe,
    interpolate_migration_gaps,
    add_migration_markers,
    get_summary_stats,
    print_summary
)
from .visualizer import create_price_chart, create_comparison_chart

__all__ = [
    'fetch_all_pools',
    'create_unified_dataframe',
    'interpolate_migration_gaps',
    'add_migration_markers',
    'get_summary_stats',
    'print_summary',
    'create_price_chart',
    'create_comparison_chart',
]
