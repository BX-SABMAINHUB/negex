'use client';

import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import AdminButton from '@/components/admin/AdminButton';

const AuthProvider = dynamic(
  () => import('@/hooks/useAuth').then((mod) => mod.AuthProvider),
  { ssr: false }
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ErrorBoundary>
          {children}
          <Toaster />
          <AdminButton />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}
