import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZERA Token - Complete Price History',
  description: 'Interactive price chart for ZERA token tracking complete history across M0N3Y → Raydium → Meteora migrations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-text">{children}</body>
    </html>
  );
}
