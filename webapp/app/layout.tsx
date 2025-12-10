import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/lib/ThemeContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Migrate Chart',
  description: 'Visualize complete price history across pool migrations with interactive charts and real-time data. Never lose sight of your token\'s journey.',
  keywords: ['token migration', 'crypto tracking', 'DeFi', 'pool migration', 'price charts', 'token transitions'],
  authors: [{ name: 'Migration Chart' }],
  openGraph: {
    title: 'Migration Chart - Track Every Token Transition',
    description: 'Visualize complete price history across pool migrations with interactive charts and real-time data.',
    type: 'website',
  },
  // Icons are automatically served from /app directory:
  // - favicon.ico (32x32)
  // - icon.svg (vector)
  // - icon.png (192x192)
  // - apple-icon.png (180x180)
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="bg-background text-text transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
