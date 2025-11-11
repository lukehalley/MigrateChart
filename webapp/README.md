# ZERA Interactive Price Chart

A Next.js web application that displays an interactive, real-time price chart for the ZERA token, tracking its complete history across all pool migrations (M0N3Y → ZERA Raydium → ZERA Meteora).

**Live App**: [zera-chart.vercel.app](https://zera-chart.vercel.app)

## Features

- 📊 **Interactive Candlestick Chart** - Built with TradingView's lightweight-charts library
- 🔄 **Real-time Data** - Fetches live data from GeckoTerminal API with automatic updates
- 📈 **Peak & Trough Markers** - Automatically detects and labels significant highs and lows
- 🔀 **Migration Tracking** - Visual markers showing pool migrations
- 🎨 **Dark Theme** - Professional dark theme matching dexscreener aesthetics
- ⚡ **Multiple Timeframes** - Switch between 1M (minute), 1H (hour), and 1D (day) views
- 📊 **Statistics** - Live price changes, ATH/ATL, volume, and more
- 🔍 **Zoom & Pan** - Full interactivity with crosshair tooltips

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

1. **SWR Hook** fetches data from GeckoTerminal API for all 3 pools
2. **Data Processing** filters data based on migration timestamps
3. **Peak/Trough Detection** identifies significant price levels
4. **Chart Rendering** displays candlesticks with markers
5. **Auto-Refresh** updates data based on timeframe:
   - 1M: Every 60 seconds
   - 1H: Every 5 minutes
   - 1D: Every hour

### Pool Configuration

The app tracks three pools:
- **M0N3Y (Original)**: `95AT5r4i85gfqeew2yR6BYFG8RLrY1d9ztPs7qrSKDVc`
- **ZERA Raydium**: `Nn9VMHJTqgG9L9F8SP3GEuFWC5zVuHrADCwehh7N7Di`
- **ZERA Meteora**: `6oUJD1EHNVBNMeTpytmY2NxKWicz5C2JUbByUrHEsjhc`

### Migration Dates

- **M0N3Y → ZERA Raydium**: October 2, 2025 08:00:00 UTC
- **ZERA Raydium → ZERA Meteora**: November 5, 2025 08:00:00 UTC

## Features Comparison

✅ 1:1 Feature Parity with Python Chart:
- [x] Candlestick OHLC display
- [x] Multiple pool tracking
- [x] Peak/trough detection
- [x] Migration markers and labels
- [x] Dark theme
- [x] Live data updates
- [x] Multiple timeframes

✅ Additional Interactive Features:
- [x] Zoom and pan
- [x] Crosshair tooltips
- [x] Real-time price updates
- [x] Responsive design
- [x] Auto-refresh data

## API Rate Limiting

GeckoTerminal API has rate limits. The app uses SWR caching and smart refresh intervals to stay within limits:
- Minute: Refresh every 60s
- Hour: Refresh every 5m
- Day: Refresh every 1h

## Deployment

Can be deployed to:
- Vercel (recommended)
- Netlify
- Railway
- Self-hosted

## License

ISC
