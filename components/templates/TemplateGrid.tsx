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
}

export const TemplateGrid = ({ templates, loading }: Props) => {
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
      router.push(`/editor/${projectId}`);
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(t => (
        <TemplateCard key={t.id} template={t} onUse={handleUse} />
      ))}
    </div>
  );
};
