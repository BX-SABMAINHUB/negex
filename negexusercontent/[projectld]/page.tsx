'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { getProjectById, updateProject } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Project } from '@/types';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

const CanvasEditor = dynamic(
  () => import('@/components/editor/CanvasEditor').then(mod => mod.CanvasEditor),
  { ssr: false }
);

export default function NegexUserContentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projectId = params.projectId as string;

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      try {
        const data = await getProjectById(projectId);
        if (!data) {
          setError('Proyecto no encontrado.');
          return;
        }
        if (data.userId !== user?.uid && !data.isPublic) {
          setError('No tienes permiso para acceder a este proyecto.');
          return;
        }
        setProject(data);
      } catch (err) {
        setError('Error al cargar el proyecto.');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, user]);

  const handleSave = async (canvasData: object, thumbnail: string) => {
    if (!project) return;
    try {
      const blob = await (await fetch(thumbnail)).blob();
      const file = new File([blob], `thumb_${project.id}.png`, { type: 'image/png' });
      const thumbUrl = await uploadImage(file, `thumbnails/${project.id}/${Date.now()}.png`);
      await updateProject(project.id, { canvasData, thumbnailUrl: thumbUrl } as any);
      toast.success('Proyecto guardado');
    } catch {
      toast.error('No se pudo guardar');
    }
  };

  const handleTitleChange = async (title: string) => {
    if (!project) return;
    setProject(prev => prev ? { ...prev, title } : null);
    try {
      await updateProject(project.id, { title } as any);
    } catch {
      toast.error('No se pudo actualizar el título');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button onClick={() => router.push('/')} className="text-primary hover:underline">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }
  if (!project) return null;

  const sizeMap: Record<string, { w: number; h: number }> = {
    vertical: { w: 1080, h: 1920 },
    horizontal: { w: 1920, h: 1080 },
    graficas: { w: 1200, h: 800 },
    tablas: { w: 1200, h: 800 },
    otros: { w: 1080, h: 1080 },
  };
  const { w, h } = sizeMap[project.plantillaTipo] || { w: 1080, h: 1920 };

  return (
    <CanvasEditor
      initialData={project.canvasData}
      onSave={handleSave}
      width={w}
      height={h}
      projectTitle={project.title}
      onTitleChange={handleTitleChange}
      projectId={project.id}
    />
  );
}
