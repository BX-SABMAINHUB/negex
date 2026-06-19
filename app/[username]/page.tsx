'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function UsernameRedirect() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router.push(`/${params.username}/plantillas`);
  }, [router, params.username]);
  return <LoadingSpinner />;
}
