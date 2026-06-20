'use client';
import { Plantilla } from '@/types';
import { TemplateCard } from './TemplateCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createProject } from '@/lib/firestore';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

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
      // Usamos el username del perfil (siempre existe gracias al fallback)
      const username = userData?.username || user.email?.split('@')[0] || 'usuario';

      const projectId = await createProject(user.uid, {
        username: username,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        plantillaTipo: template.category,
        plantillaId: template.id,
        canvasData: template.defaultCanvasData,
        thumbnailUrl: '',
        isPublic: false,
      });

      toast.success('Proyecto creado');
      router.push(`/${username}/editor/${projectId}`);
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      // Mostrar el mensaje real del error para poder depurarlo
      const mensaje = err?.message || err?.code || 'Error desconocido';
      toast.error(`Error al crear proyecto: ${mensaje}`);
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
        <p className="text-lg font-semibold mb-2">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-primary hover:underline">
            Reintentar
          </button>
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
