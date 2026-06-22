'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export const Footer = () => {
  const params = useParams();
  const username = params.username as string | undefined;
  const year = new Date().getFullYear();

  // Si no hay usuario (poco probable dentro del layout), enlazamos a una ruta genérica
  const termsUrl = username ? `/${username}/terms-and-conditions` : '/terms-and-conditions';

  return (
    <footer className="border-t bg-background py-4 text-center text-xs text-muted-foreground mt-auto">
      <span>© {year} Negex — Todos los derechos reservados.</span>{' '}
      <Link
        href={termsUrl}
        className="hover:text-primary underline underline-offset-2 transition-colors"
      >
        Términos y condiciones
      </Link>
    </footer>
  );
};
