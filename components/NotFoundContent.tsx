'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFoundContent() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <FileQuestion className="h-20 w-20 text-muted-foreground mx-auto" />
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Página no encontrada</p>
        <Link href="/">
          <Button variant="gradient">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
