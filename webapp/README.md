# Migrate Chart - Interactive Migration Tracker

A Next.js web application that displays interactive, real-time price charts for tokens across pool migrations and transitions. Currently tracking ZERA token's complete migration history (M0N3Y → ZERA Raydium → ZERA Meteora), but designed to support any token migration scenario.

**Live App**: [migrate-chart.vercel.app](https://migrate-chart.vercel.app)

## Features

- 📊 **Interactive Candlestick Chart** - Professional charting with TradingView's lightweight-charts library
- 🔄 **Real-time Data** - Fetches live data from GeckoTerminal API with smart automatic updates
- 📈 **Peak & Trough Markers** - Automatically detects and labels significant price levels
- 🔀 **Migration Tracking** - Visual markers and event indicators for pool migrations and transitions
- 🎨 **Dark Theme** - Professional dark theme with excellent readability
- ⚡ **Multiple Timeframes** - Switch between 1M (minute), 1H (hour), and 1D (day) views
- 📊 **Comprehensive Statistics** - Live price changes, ATH/ATL, volume, and cross-pool analytics
- 🔍 **Full Interactivity** - Zoom, pan, and crosshair tooltips for detailed analysis
- 🎯 **Configurable** - Easily adapt to track any token migration scenario

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Charting**: lightweight-charts (TradingView)
- **Data Fetching**: SWR (with automatic revalidation)
- **Styling**: Tailwind CSS
- **API**: GeckoTerminal REST API

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
webapp/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main page with chart and stats
│   └── globals.css      # Global styles and dark theme
├── components/
│   └── Chart.tsx        # Interactive chart component
├── lib/
│   ├── types.ts         # TypeScript types and constants
│   └── api.ts           # API functions and data processing
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## How It Works

### Data Flow

1. **SWR Hook** fetches data from GeckoTerminal API for all configured pools
2. **Data Processing** filters and consolidates data based on migration timestamps
3. **Peak/Trough Detection** identifies significant price levels across all migration periods
4. **Chart Rendering** displays unified candlesticks with migration event markers
5. **Smart Auto-Refresh** updates data based on timeframe:
   - 1M: Every 60 seconds
   - 1H: Every 5 minutes
   - 1D: Every hour

### Example Configuration: ZERA Token

The current instance tracks three pools for ZERA:
- **M0N3Y (Original)**: `95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc`
- **ZERA Raydium**: `Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di`
- **ZERA Meteora**: `6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc`

**Migration Dates:**
- **M0N3Y → ZERA Raydium**: October 2, 2025 08:00:00 UTC
- **ZERA Raydium → ZERA Meteora**: November 5, 2025 08:00:00 UTC

To track a different token, update the pool addresses and migration dates in the configuration.

## Core Capabilities

### Chart Features
- [x] Professional candlestick OHLC display
- [x] Multi-pool migration tracking
- [x] Automatic peak/trough detection
- [x] Migration event markers and labels
- [x] Multiple timeframe support (1M, 1H, 1D)
- [x] Dark theme optimized for readability

### Interactive Features
- [x] Zoom and pan functionality
- [x] Crosshair tooltips with detailed data
- [x] Real-time price updates
- [x] Responsive design (mobile & desktop)
- [x] Smart auto-refresh based on timeframe
- [x] Comprehensive statistics dashboard

## API Rate Limiting

GeckoTerminal API has rate limits. The app uses SWR caching and smart refresh intervals to stay within limits:
- Minute: Refresh every 60s
- Hour: Refresh every 5m
- Day: Refresh every 1h

## Deployment

This Next.js application can be deployed to any platform that supports Node.js:
- **Vercel** (recommended) - Zero-config deployment
- **Netlify** - Easy deployment with continuous integration
- **Railway** - Simple container deployment
- **Self-hosted** - Deploy on your own infrastructure

## Customization

To track a different token migration:
1. Update pool addresses in the configuration file
2. Set migration timestamps
3. Adjust token symbols and names
4. Customize chart colors and branding as needed

The platform is designed to be easily adaptable to any token migration scenario.

## License

ISC
