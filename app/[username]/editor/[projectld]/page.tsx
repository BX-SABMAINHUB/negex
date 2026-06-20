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

// El editor solo se carga en el cliente (sin SSR)
const CanvasEditor = dynamic(
  () => import('@/components/editor/CanvasEditor').then(mod => mod.CanvasEditor),
  { ssr: false }
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milisegundos entre reintentos

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.projectId as string;

  // Función recursiva para obtener el proyecto con reintentos
  const tryFetchProject = useCallback(
    async (attempt = 1): Promise<Project> => {
      try {
        const data = await getProjectById(projectId);
        if (!data) throw new Error('El proyecto no existe o fue eliminado.');
        if (data.userId !== user?.uid && !data.isPublic) {
          throw new Error('No tienes permiso para acceder a este proyecto.');
        }
        return data;
      } catch (err: any) {
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return tryFetchProject(attempt + 1);
        }
        // Agotados los reintentos, lanzamos el error real
        throw err;
      }
    },
    [user, projectId]
  );

  const fetchProject = useCallback(async () => {
    if (!user) {
      setError('No has iniciado sesión.');
      setLoading(false);
      return;
    }

    try {
      const data = await tryFetchProject();
      setProject(data);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar proyecto:', err);
      let mensaje = err.message || 'Error desconocido al cargar el proyecto.';
      if (err.code === 'permission-denied')
        mensaje = 'Error de permisos en la base de datos.';
      if (mensaje.includes('Tiempo de espera'))
        mensaje = 'El servidor tardó demasiado en responder.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  }, [user, tryFetchProject]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Guardar el proyecto
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

  // Cambiar el título del proyecto
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

  // --- Renderizado condicional ---

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
        <div className="text-center space-y-4 max-w-md px-4">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{error}</p>
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

  if (!project) return null;

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
