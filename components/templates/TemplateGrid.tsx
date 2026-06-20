'use client';
import { Plantilla } from '@/types';
import { TemplateCard } from './TemplateCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createProject } from '@/lib/firestore';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  templates: Plantilla[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const TemplateGrid = ({ templates, loading, error, onRetry }: Props) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleUse = async (template: Plantilla) => {
    if (!user) return;
    try {
      const projectId = await createProject(user.uid, {
        username: user.displayName || 'user',
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        plantillaTipo: template.category,
        plantillaId: template.id,
        canvasData: template.defaultCanvasData,
        thumbnailUrl: '',
        isPublic: false,
      });
      toast.success('Proyecto creado');
      router.push(`/${user.displayName}/editor/${projectId}`);
    } catch {
      toast.error('Error al crear proyecto');
    }
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
        <p className="text-sm mb-4">Puede que la colección esté vacía. Ejecuta el seed o añade plantillas manualmente.</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(t => (
        <TemplateCard key={t.id} template={t} onUse={handleUse} />
      ))}
    </div>
  );
};
