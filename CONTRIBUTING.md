# Contributing to MigrateChart

Thank you for your interest in contributing to MigrateChart! This document provides guidelines for contributing to the project.

## Live Site

The production site runs at [migrate-chart.fun](https://migrate-chart.fun)

## Project Architecture

MigrateChart is a Next.js application with a Supabase backend:

- **`/webapp`** - Next.js 14 frontend with App Router, TypeScript, and Tailwind CSS
- **Supabase** - PostgreSQL database, authentication, and storage

### Infrastructure Note

The production Vercel deployment and Supabase database are maintained by the project owner. Contributors can:

- Run the webapp locally with their own Supabase instance
- Submit PRs that will be tested against the production infrastructure before merging

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (for local development)

### Local Development Setup

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
   # Edit .env.local with your Supabase credentials
   npm run dev
   ```

3. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000)

## How to Contribute

### Reporting Bugs

- Check existing issues first to avoid duplicates
- Use the bug report template if available
- Include steps to reproduce, expected behavior, and actual behavior
- Add screenshots or logs if applicable

### Suggesting Features

- Open an issue with the "feature request" label
- Describe the use case and why it would be valuable
- Be open to discussion about implementation approaches

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style and conventions
   - Write clear commit messages
   - Add tests if applicable

3. **Test your changes locally**
   - Ensure the webapp builds: `npm run build`
   - Run linting: `npm run lint`

4. **Submit your PR**
   - Fill out the PR template
   - Link any related issues
   - Describe what your changes do and why

### Code Style

- **TypeScript**: Follow the existing ESLint configuration
- **Commits**: Use clear, descriptive commit messages

## Areas for Contribution

Here are some areas where contributions are especially welcome:

- **New token support** - Add configurations for tracking other token migrations
- **Chart improvements** - Enhance visualization and interactivity
- **Documentation** - Improve guides, add examples
- **Performance** - Optimize data fetching and rendering
- **Testing** - Add unit and integration tests
- **Accessibility** - Improve a11y compliance

## Questions?

If you have questions about contributing, feel free to:

- Open a discussion on GitHub
- Check existing issues and discussions

## Code of Conduct

Please be respectful and constructive in all interactions. We're building this together!

## License

By contributing to MigrateChart, you agree that your contributions will be licensed under the MIT License.
