import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import './globals.css';

const AuthProvider = dynamic(
  () => import('@/hooks/useAuth').then((mod) => mod.AuthProvider),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Negex — Diseño y datos fusionados',
  description: 'Editor visual profesional con capacidades de hoja de cálculo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans scrollbar-thin">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ErrorBoundary>
              {children}
              <Toaster />
            </ErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
