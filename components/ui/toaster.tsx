'use client';
import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => (
  <SonnerToaster
    position="bottom-right"
    toastOptions={{
      className: 'font-sans',
    }}
  />
);
