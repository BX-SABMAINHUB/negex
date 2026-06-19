'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // espera silenciosa
    if (user) {
      // Si ya hay sesión, ir al Dashboard personal
      router.push(`/${user.displayName || 'usuario'}`);
    } else {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mientras se verifica la sesión no mostramos nada (pantalla en blanco), así se siente instantáneo
  return null;
}
