'use client';
import { useState } from 'react';
import { Plantilla } from '@/types';
import { TemplateCard } from './TemplateCard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createProject } from '@/lib/firestore';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  templates: Plantilla[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

// Lienzo vacío garantizado
const BLANK_CANVAS = {
  version: '5.3.0',
  objects: [],
  background: '#ffffff',
};

export const TemplateGrid = ({ templates, loading, error, onRetry }: Props) => {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Plantilla | null>(null);
  const [creating, setCreating] = useState(false);

  const openConfirm = (template: Plantilla) => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear un proyecto');
      return;
    }
    setSelectedTemplate(template);
  };

  const handleConfirm = async () => {
    if (!selectedTemplate || !user) return;
    setCreating(true);
    try {
      const username = userData?.username || user.email?.split('@')[0] || 'usuario';

      // Datos del lienzo 100% seguros
      const raw = selectedTemplate.defaultCanvasData as any;
      let canvasData = BLANK_CANVAS;
      if (raw && typeof raw === 'object' && !Array.isArray(raw) && raw.version && Array.isArray(raw.objects)) {
        canvasData = raw;
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.version && Array.isArray(parsed.objects)) {
            canvasData = parsed;
          }
        } catch {}
      }

      const projectId = await createProject(user.uid, {
        username,
        title: `${selectedTemplate.name} - ${new Date().toLocaleDateString()}`,
        plantillaTipo: selectedTemplate.category,
        plantillaId: selectedTemplate.id,
        canvasData,
        thumbnailUrl: '',
        isPublic: false,
      });

      toast.success('Proyecto creado');
      setSelectedTemplate(null);
      // Dar tiempo a que Firestore propague el documento
      setTimeout(() => {
        router.push(`/${username}/editor/${projectId}`);
      }, 1000);
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      toast.error(`Error al crear proyecto: ${err?.message || err?.code || 'Error desconocido'}`);
    } finally {
      setCreating(false);
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <TemplateCard key={t.id} template={t} onUse={openConfirm} />
        ))}
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Usar esta plantilla?</DialogTitle>
            <DialogDescription>
              Se creará un nuevo proyecto basado en <strong>{selectedTemplate?.name}</strong>.
              ¿Quieres continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)} disabled={creating}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleConfirm} disabled={creating}>
              {creating ? 'Creando...' : 'Sí, usar plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
