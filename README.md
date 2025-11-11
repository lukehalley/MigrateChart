# ZERA Historical Price Tracker

A comprehensive tool to track the complete price history of ZERA token, including its previous incarnation as M0N3Y and all pool migrations on Solana.

**Live Chart**: [zera-chart.vercel.app](https://zera-chart.vercel.app)

## Overview

This project consolidates price data from three different liquidity pools to create a unified historical price timeline:

1. **M0N3Y** (Original token) - Pool: `95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc`
2. **ZERA Raydium** (First migration) - Pool: `Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di`
3. **ZERA Meteora** (Current pool) - Pool: `6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc`

### Migration Timeline

- **October 2, 2025**: M0N3Y migrated to ZERA (Raydium)
- **November 5, 2025**: ZERA Raydium migrated to Meteora (current)

## Features

- Fetches historical OHLCV data from GeckoTerminal API
- Consolidates data from multiple pools into a unified timeline
- Generates comprehensive price charts with migration markers
- Exports data to CSV for further analysis
- Calculates summary statistics across the entire history
- Creates comparison charts across different pools

## Installation

1. Clone this repository or download the files

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

Simply run the main script:

```bash
python main.py
```

This will:
1. Fetch data from all three pools via GeckoTerminal API
2. Consolidate the data into a unified timeline
3. Generate summary statistics
4. Export data to `output/zera_unified_price_history.csv`
5. Create visualization charts in the `output/` directory

### Output Files

The script generates the following files in the `output/` directory:

- `zera_unified_price_history.csv` - Complete price history data
- `zera_price_chart.png` - Main price and volume chart with migration markers
- `zera_comparison_chart.png` - Comparison metrics across pools

### Individual Module Testing

You can also test individual modules:

```bash
# Test the data fetcher
python fetcher.py

# Test the consolidator
python consolidator.py

# Test the visualizer
python visualizer.py
```

## Project Structure

```
zera_chrt/
├── README.md              # This file
├── requirements.txt       # Python dependencies
├── config.py             # Configuration (pool addresses, API settings)
├── fetcher.py            # GeckoTerminal API data fetcher
├── consolidator.py       # Data consolidation and statistics
├── visualizer.py         # Chart generation
├── main.py               # Main orchestration script
└── output/               # Generated output files (created on first run)
    ├── zera_unified_price_history.csv
    ├── zera_price_chart.png
    └── zera_comparison_chart.png
```

## Data Structure

The consolidated CSV file contains the following columns:

- `timestamp` - Unix timestamp
- `date` - Human-readable date
- `open` - Opening price (SOL)
- `high` - Highest price (SOL)
- `low` - Lowest price (SOL)
- `close` - Closing price (SOL)
- `volume` - Trading volume (SOL)
- `pool_name` - Source pool identifier
- `pool_address` - Solana pool address
- `token_symbol` - Token symbol (M0N3Y or ZERA)
- `price_change` - Daily price change (SOL)
- `price_change_pct` - Daily price change percentage
- `migration_event` - Migration event marker (if applicable)

## Configuration

You can modify [config.py](config.py) to:

- Update pool addresses if new migrations occur
- Change API endpoints or timeframes
- Adjust output file names and locations
- Modify migration dates

## API Information

This project uses the [GeckoTerminal API](https://www.geckoterminal.com/api) to fetch historical price data.

- **Endpoint**: `https://api.geckoterminal.com/api/v2`
- **Rate Limiting**: The script includes automatic delays between requests to be respectful to the API
- **Data Granularity**: Daily OHLCV (Open, High, Low, Close, Volume)

## Requirements

- Python 3.8+
- Internet connection to fetch data from GeckoTerminal API
- Dependencies listed in [requirements.txt](requirements.txt)

## License

This is an open-source project created for tracking ZERA token price history.

## Support

For issues or questions, please refer to the project documentation or contact the maintainer.
