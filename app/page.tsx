'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function HomePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // esperar a que se resuelva la autenticación
    if (user) {
      // Si tenemos datos de usuario (incluso el de respaldo), redirigir al dashboard
      const username = userData?.username || user.email?.split('@')[0] || 'usuario';
      router.push(`/${username}/plantillas`);
    } else {
      router.push('/login');
    }
  }, [user, userData, loading, router]);

  return <LoadingSpinner />;
}
