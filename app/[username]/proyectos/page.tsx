'use client';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function ProyectosPage() {
  const { projects, loading } = useProjects();
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis proyectos</h1>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No tienes proyectos aún. ¡Crea uno desde las plantillas!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Actualizado {project.updatedAt?.toDate().toLocaleDateString() || 'recientemente'}
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => router.push(`/${project.username}/editor/${project.id}`)}
                >
                  Abrir editor
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
