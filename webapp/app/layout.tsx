import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Migration Chart',
  description: 'Track complete price history across token migrations with interactive charts and real-time data',
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
    <html lang="en">
      <body className="bg-background text-text">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
