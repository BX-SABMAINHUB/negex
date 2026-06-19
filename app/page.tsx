'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.push(`/${user.displayName || 'usuario'}`);
    } else {
      router.push('/login');
    }
  }, [user, loading, router]);

  return null;
}
