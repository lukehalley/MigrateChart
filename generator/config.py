"""
Configuration for ZERA Historical Price Tracker
"""

# GeckoTerminal API Configuration
BASE_URL = "https://api.geckoterminal.com/api/v2"
NETWORK = "solana"
# TIMEFRAME options (API returns last 100 data points):
#   "minute" - Last ~1.67 hours (100 minutes)
#   "hour"   - Last ~4 days (100 hours) - RECOMMENDED for recent detail
#   "day"    - Last ~3+ months (100 days) - REQUIRED for full migration history
TIMEFRAME = "day"

# Pool Addresses (in chronological order)
POOLS = {
    "mon3y": {
        "address": "95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc",
        "name": "M0N3Y (Original)",
        "token_symbol": "M0N3Y",
        "active_until": "2025-10-02"  # Migration date
    },
    "zera_Raydium": {
        "address": "Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di",
        "name": "ZERA Raydium",
        "token_symbol": "ZERA",
        "active_from": "2025-10-02",
        "active_until": "2025-11-05"  # Second migration date
    },
    "zera_Meteora": {
        "address": "6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc",
        "name": "ZERA Meteora",
        "token_symbol": "ZERA",
        "active_from": "2025-11-05"
    }
}

# Migration Dates (Unix timestamps)
MIGRATION_DATES = {
    "mon3y_to_zera": 1759363200,  # October 2, 2025 08:00:00 UTC
    "zera_Raydium_to_Meteora": 1762300800  # November 5, 2025 08:00:00 UTC (Raydium to Meteora)
}

# Output Configuration
OUTPUT_DIR = "output"
CSV_FILENAME = "zera_unified_price_history.csv"
CHART_FILENAME = "zera_price_chart.png"
