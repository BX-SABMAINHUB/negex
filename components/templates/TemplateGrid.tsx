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

      // Solo aceptar datos de lienzo válidos
      let canvasData = BLANK_CANVAS;
      const raw = selectedTemplate.defaultCanvasData as any;
      if (
        raw &&
        typeof raw === 'object' &&
        !Array.isArray(raw) &&
        typeof raw.version === 'string' &&
        Array.isArray(raw.objects)
      ) {
        canvasData = raw;
      } else if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed) &&
            typeof parsed.version === 'string' &&
            Array.isArray(parsed.objects)
          ) {
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

  // Resto del componente (loading, error, empty, grid) igual que antes...
  return (
    <>
      {/* ... */}
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
