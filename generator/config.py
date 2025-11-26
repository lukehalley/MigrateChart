"""
Configuration for Token Migration Tracking Platform

This configuration supports tracking any token migration scenario.
Simply update the pool addresses, migration dates, and token metadata
to track a different token's migration history.
"""

# GeckoTerminal API Configuration
BASE_URL = "https://api.geckoterminal.com/api/v2"
NETWORK = "solana"  # Network where pools are deployed (e.g., "solana", "ethereum", "bsc")
# TIMEFRAME options (API returns last 100 data points):
#   "minute" - Last ~1.67 hours (100 minutes)
#   "hour"   - Last ~4 days (100 hours) - RECOMMENDED for recent detail
#   "day"    - Last ~3+ months (100 days) - REQUIRED for full migration history
TIMEFRAME = "day"

# Pool Configuration (in chronological order)
# Each pool represents a phase in the token's migration history.
# Configure multiple pools to track complete migration timelines.
#
# Example configuration for ZERA token migration:
# M0N3Y (original) → ZERA Raydium → ZERA Meteora
POOLS = {
    "mon3y": {
        "address": "95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc",  # GeckoTerminal pool address
        "name": "M0N3Y (Original)",  # Human-readable pool name
        "token_symbol": "M0N3Y",  # Token symbol for this phase
        "active_until": "2025-10-02"  # Date this pool became inactive (YYYY-MM-DD)
    },
    "zera_Raydium": {
        "address": "Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di",
        "name": "ZERA Raydium",
        "token_symbol": "ZERA",
        "active_from": "2025-10-02",  # Date this pool became active
        "active_until": "2025-11-05"  # Date this pool became inactive
    },
    "zera_Meteora": {
        "address": "6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc",
        "name": "ZERA Meteora",
        "token_symbol": "ZERA",
        "active_from": "2025-11-05"  # Current active pool (no active_until)
    }
}

# Migration Dates (Unix timestamps)
# Define the exact timestamps when migrations occurred.
# These are used to mark migration events in charts and data.
MIGRATION_DATES = {
    "mon3y_to_zera": 1759363200,  # October 2, 2025 08:00:00 UTC
    "zera_Raydium_to_Meteora": 1762300800  # November 5, 2025 08:00:00 UTC
}

# Output Configuration
# Customize output file locations and naming conventions
OUTPUT_DIR = "output"
CSV_FILENAME = "zera_unified_price_history.csv"  # Change for different tokens
CHART_FILENAME = "zera_price_chart.png"  # Change for different tokens

# To track a different token:
# 1. Update POOLS with new pool addresses and migration dates
# 2. Update MIGRATION_DATES with new migration timestamps
# 3. Update OUTPUT filenames to match the new token name
# 4. Optionally update NETWORK if tracking tokens on different chains
