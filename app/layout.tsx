import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Business in a Link',
  description: 'Social-first booking OS for service businesses'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
