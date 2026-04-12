import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BisLink',
  description: 'BisLink is a social-first booking OS for service businesses.',
  metadataBase: new URL('https://bislink.app')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
