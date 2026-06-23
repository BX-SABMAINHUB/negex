'use client';
import { useState, useEffect } from 'react';
import { Plantilla } from '@/types';
import { TemplateCard } from './TemplateCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const codeStore = new Map<string, { template: Plantilla; timestamp: number }>();

function generateCode(category: string): string {
  const prefix = category.substring(0, 4).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
}

interface Props {
  templates: Plantilla[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const TemplateGrid = ({ templates, loading, error, onRetry }: Props) => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Plantilla | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__templateCodeStore = codeStore;
    }
  }, []);

  const openConfirm = (template: Plantilla) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }
    setSelectedTemplate(template);
  };

  const handleConfirm = async () => {
    if (!selectedTemplate || !user) return;
    setCreating(true);

    const code = generateCode(selectedTemplate.category);
    codeStore.set(code, { template: selectedTemplate, timestamp: Date.now() });

    toast.success(`Tu código es: ${code}`, { duration: 10000 });
    await navigator.clipboard.writeText(code);
    toast.info('Código copiado al portapapeles');

    setSelectedTemplate(null);
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/5] w-full rounded-xl" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold mb-2">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        )}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-semibold mb-2">No hay plantillas disponibles</p>
        <p className="text-sm">Crea una con el botón + o importa plantillas.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <TemplateCard key={t.id} template={t} onUse={openConfirm} />
        ))}
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Usar esta plantilla?</DialogTitle>
            <DialogDescription>
              Recibirás un código para canjear la plantilla <strong>{selectedTemplate?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)} disabled={creating}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleConfirm} disabled={creating}>
              {creating ? 'Generando código...' : 'Obtener código'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
