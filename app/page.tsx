'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function HomePage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && userData?.username) {
      router.push(`/${userData.username}/plantillas`);
    } else if (!user) {
      router.push('/login');
    }
  }, [user, userData, loading, router]);

  return <LoadingSpinner />;
}
