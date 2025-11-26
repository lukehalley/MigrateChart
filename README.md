# Migrate Chart - Universal Token Migration Tracker

A comprehensive platform to track complete price history for any token across pool migrations and chain transitions. Currently tracking ZERA token migrations on Solana, but designed to support any token migration scenario.

**Live Chart**: [migrate-chart.vercel.app](https://migrate-chart.vercel.app)

## Overview

This platform consolidates price data from multiple liquidity pools to create unified historical price timelines for tokens that have undergone migrations, rebrands, or pool transitions. The system intelligently handles data gaps during migration periods through smart interpolation.

### Example: ZERA Token Migration History

This instance tracks ZERA's complete journey across three pools:

1. **M0N3Y** (Original token) - Pool: `95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc`
2. **ZERA Raydium** (First migration) - Pool: `Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di`
3. **ZERA Meteora** (Current pool) - Pool: `6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc`

#### Migration Timeline

- **October 2, 2025**: M0N3Y migrated to ZERA (Raydium)
- **November 5, 2025**: ZERA Raydium migrated to Meteora (current)

## Features

- **Multi-Pool Support**: Fetches historical OHLCV data from multiple liquidity pools via GeckoTerminal API
- **Smart Consolidation**: Merges data from different pools into a unified timeline with intelligent gap interpolation
- **Migration Tracking**: Visual markers and events to track pool migrations and token transitions
- **Comprehensive Analysis**: Generates price charts, summary statistics, and comparison metrics
- **Data Export**: CSV exports for further analysis and integration
- **Configurable**: Easy configuration for any token migration scenario

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
1. Fetch data from all configured pools via GeckoTerminal API
2. Consolidate the data into a unified timeline with migration handling
3. Generate summary statistics across all migration periods
4. Export data to CSV in the `output/` directory
5. Create visualization charts with migration markers

### Output Files

The script generates the following files in the `output/` directory:

- `*_unified_price_history.csv` - Complete price history data across all migrations
- `*_price_chart.png` - Main price and volume chart with migration event markers
- `*_comparison_chart.png` - Comparison metrics across different pools/migrations

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
migrate-chart/
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── generator/
│   ├── config.py            # Configuration (pool addresses, migration dates, API settings)
│   ├── fetcher.py           # GeckoTerminal API data fetcher
│   ├── consolidator.py      # Data consolidation and migration gap handling
│   ├── visualizer.py        # Chart generation with migration markers
│   └── main.py              # Main orchestration script
├── webapp/                   # Next.js web interface for interactive charts
└── output/                   # Generated output files (created on first run)
    ├── *_unified_price_history.csv
    ├── *_price_chart.png
    └── *_comparison_chart.png
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
- `token_symbol` - Token symbol for the current pool
- `price_change` - Daily price change
- `price_change_pct` - Daily price change percentage
- `migration_event` - Migration event marker (if applicable)

## Configuration

The platform is highly configurable through [generator/config.py](generator/config.py):

- **Pool Configuration**: Define multiple pool addresses with their active periods
- **Migration Dates**: Specify exact timestamps for migration events
- **API Settings**: Configure GeckoTerminal API endpoints and timeframes
- **Output Settings**: Customize file names and output locations
- **Token Metadata**: Set token symbols and pool names for each migration phase

To track a different token migration, simply update the pool addresses, migration dates, and token symbols in config.py.

## API Information

This project uses the [GeckoTerminal API](https://www.geckoterminal.com/api) to fetch historical price data.

- **Endpoint**: `https://api.geckoterminal.com/api/v2`
- **Rate Limiting**: The script includes automatic delays between requests to be respectful to the API
- **Data Granularity**: Daily OHLCV (Open, High, Low, Close, Volume)

## Requirements

- Python 3.8+
- Node.js 18+ (for webapp)
- Internet connection to fetch data from GeckoTerminal API
- Dependencies listed in [requirements.txt](requirements.txt) and [webapp/package.json](webapp/package.json)

## Use Cases

This platform is ideal for:
- Tracking token migrations across different DEXs or pools
- Analyzing price impact of pool migrations or rebrands
- Creating unified price histories for tokens with complex migration histories
- Visualizing multi-phase token launches and transitions
- Historical analysis of liquidity pool changes

## License

This is an open-source project for tracking token migration price histories across multiple pools and platforms.

## Support

For issues, questions, or feature requests, please refer to the project documentation or open an issue on GitHub.
