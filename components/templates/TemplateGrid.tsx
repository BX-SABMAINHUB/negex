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
  const { user, userData } = useAuth();
  const router = useRouter();

  const handleUse = async (template: Plantilla) => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un proyecto');
      return;
    }

    try {
      const username = userData?.username || user.email?.split('@')[0] || 'usuario';

      // Asegurar que el canvasData es válido (si no, lienzo vacío)
      const raw = template.defaultCanvasData as any;
      const canvasData =
        raw && typeof raw === 'object' && raw.version && Array.isArray(raw.objects)
          ? raw
          : { version: '5.3.0', objects: [], background: '#ffffff' };

      const projectId = await createProject(user.uid, {
        username: username,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        plantillaTipo: template.category,
        plantillaId: template.id,
        canvasData: canvasData,
        thumbnailUrl: '',
        isPublic: false,
      });

      toast.success('Proyecto creado');
      // Aumentamos el retardo a 1.2 segundos para asegurar que Firestore propague el documento
      setTimeout(() => {
        router.push(`/${username}/editor/${projectId}`);
      }, 1200);
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      toast.error(`Error al crear proyecto: ${err?.message || err?.code || 'Error desconocido'}`);
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
        <p className="text-sm">Crea una nueva con el botón + o importa plantillas en Firestore.</p>
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
