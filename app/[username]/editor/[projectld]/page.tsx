'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getProjectById, updateProject } from '@/lib/firestore';
import { CanvasEditor } from '@/components/editor/CanvasEditor';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Project } from '@/types';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(params.projectId as string);
        if (!data || (data.userId !== user?.uid && !data.isPublic)) {
          toast.error('Proyecto no encontrado o sin acceso');
          router.push('/plantillas');
          return;
        }
        setProject(data);
      } catch {
        toast.error('Error al cargar proyecto');
        router.push('/plantillas');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProject();
  }, [params.projectId, user, router]);

  const handleSave = async (canvasData: object, thumbnail: string) => {
    if (!project) return;
    const blob = await (await fetch(thumbnail)).blob();
    const file = new File([blob], `thumb_${project.id}.png`, { type: 'image/png' });
    const thumbUrl = await uploadImage(file, `thumbnails/${project.id}/${Date.now()}.png`);
    await updateProject(project.id, { canvasData, thumbnailUrl: thumbUrl } as any);
  };

  const handleTitleChange = async (title: string) => {
    if (!project) return;
    setProject({ ...project, title });
    await updateProject(project.id, { title } as any);
  };

  if (loading) return <LoadingSpinner />;
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
