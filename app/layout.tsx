import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Negex — Diseño y datos fusionados',
  description: 'Editor visual profesional con capacidades de hoja de cálculo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans scrollbar-thin">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
