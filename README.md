# Migrate Chart - Universal Token Migration Tracker

A comprehensive platform to track complete price history for any token across pool migrations and chain transitions. Currently tracking token migrations on Solana.

**Live Site**: [migrate-chart.fun](https://migrate-chart.fun)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

## Overview

This platform consolidates price data from multiple liquidity pools to create unified historical price timelines for tokens that have undergone migrations, rebrands, or pool transitions. The system intelligently handles data gaps during migration periods through smart interpolation.

## Features

- **Unified Price History** - Combines pre and post-migration charts into a single continuous timeline
- **Multi-Pool Support** - Fetches historical OHLCV data from multiple liquidity pools via GeckoTerminal API
- **Migration Markers** - Visual indicators showing exactly when migrations occurred
- **Holder Analytics** - Track holder counts over time across migrations
- **Burns Tracking** - Monitor token burns with visual timeline
- **Interactive Charts** - TradingView-style candlestick charts with full interactivity

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Charts**: Lightweight Charts (TradingView)
- **Deployment**: Vercel
- **Data**: GeckoTerminal API, Solana RPC

## Project Structure

```
migrate-chart/
├── webapp/                   # Next.js application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities and Supabase client
│   └── public/               # Static assets
├── docs/                     # Documentation
├── .github/                  # GitHub templates and workflows
├── CONTRIBUTING.md           # Contribution guidelines
├── SECURITY.md               # Security policy
└── LICENSE                   # MIT License
```

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/lukehalley/MigrateChart.git
   cd MigrateChart
   ```

2. **Set up the webapp**
   ```bash
   cd webapp
   npm install
   cp .env.local.example .env.local
   ```

3. **Configure environment variables**

   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Infrastructure Note

The production Vercel deployment and Supabase database are maintained by the project owner. Contributors can:
- Run the webapp locally with their own Supabase instance
- Submit PRs that will be tested against production infrastructure before merging

## Use Cases

- Tracking token migrations across different DEXs or pools
- Analyzing price impact of pool migrations or rebrands
- Creating unified price histories for tokens with complex migration histories
- Visualizing multi-phase token launches and transitions
- Historical analysis of liquidity pool changes

## Security

For security concerns, please see [SECURITY.md](SECURITY.md) or email migratechart@gmail.com.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/lukehalley/MigrateChart/issues) on GitHub.
