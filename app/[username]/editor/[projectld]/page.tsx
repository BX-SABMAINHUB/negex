'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { getProjectById, updateProject } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Project } from '@/types';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

// Editor solo en cliente
const CanvasEditor = dynamic(
  () => import('@/components/editor/CanvasEditor').then(mod => mod.CanvasEditor),
  { ssr: false }
);

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.projectId as string;

  const fetchProject = useCallback(async () => {
    // Si no hay usuario, esperar un poco y luego dar error si sigue sin estar
    if (!user) {
      // Pequeña espera por si el usuario está en proceso de login
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!user) {
        setError('No se ha podido autenticar. Vuelve a iniciar sesión.');
        setLoading(false);
        return;
      }
    }

    // Intentar cargar el proyecto con un timeout de seguridad (10 segundos máximo)
    const timeout = new Promise<Project | null>((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000)
    );

    try {
      const data = await Promise.race([getProjectById(projectId), timeout]);

      if (!data) {
        setError('El proyecto no existe o fue eliminado.');
        return;
      }

      if (data.userId !== user!.uid && !data.isPublic) {
        setError('No tienes permiso para acceder a este proyecto.');
        return;
      }

      // Éxito
      setProject(data);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar proyecto:', err);
      setError(
        err.message === 'permission-denied'
          ? 'Error de permisos en la base de datos.'
          : 'Error al cargar el proyecto. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Guardar cambios
  const handleSave = async (canvasData: object, thumbnail: string) => {
    if (!project) return;
    try {
      const blob = await (await fetch(thumbnail)).blob();
      const file = new File([blob], `thumb_${project.id}.png`, { type: 'image/png' });
      const thumbUrl = await uploadImage(file, `thumbnails/${project.id}/${Date.now()}.png`);
      await updateProject(project.id, { canvasData, thumbnailUrl: thumbUrl } as any);
      toast.success('Proyecto guardado');
    } catch (err) {
      console.error('Error al guardar:', err);
      toast.error('No se pudo guardar el proyecto');
    }
  };

  // Cambiar título
  const handleTitleChange = async (title: string) => {
    if (!project) return;
    setProject(prev => (prev ? { ...prev, title } : null));
    try {
      await updateProject(project.id, { title } as any);
    } catch (err) {
      console.error('Error al actualizar título:', err);
      toast.error('No se pudo actualizar el título');
    }
  };

  // Renderizado condicional
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => router.push('/')}
              className="text-primary hover:underline"
            >
              Volver al inicio
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null; // Seguridad

  // Dimensiones según tipo de plantilla
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
