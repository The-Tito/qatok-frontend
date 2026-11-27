import type { Metadata } from 'next';
import { Chakra_Petch, IBM_Plex_Mono, Silkscreen } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import '../components/ui.css';
import { Providers } from './providers';

const title = Chakra_Petch({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-chakra-petch',
  display: 'swap',
});

const label = Silkscreen({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-silkscreen',
  display: 'swap',
});

const body = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: "QATO'K", template: "%s · QATO'K" },
  description:
    'Practica decisiones del trabajo, mira sus consecuencias y sube de nivel tus habilidades.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${title.variable} ${label.variable} ${body.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
