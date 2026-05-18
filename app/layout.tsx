import './globals.css';
import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Instrument_Serif,
  Manrope,
  Sora,
  Space_Grotesk
} from 'next/font/google';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant-garamond'
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans'
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces'
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif'
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope'
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sora'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk'
});

export const metadata: Metadata = {
  title: 'BisLink',
  description: 'BisLink is a social-first booking OS for service businesses.',
  metadataBase: new URL('https://bislink.app')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[
        cormorantGaramond.variable,
        dmSans.variable,
        fraunces.variable,
        instrumentSerif.variable,
        manrope.variable,
        sora.variable,
        spaceGrotesk.variable
      ].join(' ')}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
