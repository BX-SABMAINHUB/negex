'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getProjectById, updateProject } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Project } from '@/types';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

// Carga dinámica del editor
const CanvasEditor = dynamic(
  () => import('@/components/editor/CanvasEditor').then(mod => mod.CanvasEditor),
  { ssr: false }
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function NegexUserContentPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const projectId = params.projectId as string;

  // Obtener el proyecto (público)
  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await getProjectById(projectId);
        if (!data) throw new Error('El proyecto no existe.');
        if (!data.isPublic) throw new Error('El proyecto no es público.');
        setProject(data);
        return; // éxito
      } catch (err: any) {
        console.error(`Intento ${attempt}:`, err);
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          setError(err.message || 'Error al cargar el proyecto.');
        }
      }
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Activar un temporizador de seguridad para el editor
  useEffect(() => {
    if (!loading && project) {
      const timer = setTimeout(() => setEditorReady(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, project]);

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
    await updateProject(project.id, { title } as any);
  };

  // Mostrar spinner solo los primeros segundos
  if (loading || (!editorReady && !error)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

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
