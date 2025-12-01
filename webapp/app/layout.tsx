import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
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
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="bg-background text-text">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
