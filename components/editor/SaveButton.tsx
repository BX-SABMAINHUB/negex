'use client';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface Props {
  onSave: () => void;
  saving: boolean;
  lastSaved?: Date;
}

export const SaveButton = ({ onSave, saving, lastSaved }: Props) => (
  <div className="flex items-center gap-2">
    {lastSaved && <span className="text-xs text-muted-foreground">Guardado hace {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s</span>}
    <Button onClick={onSave} disabled={saving} variant="gradient" size="sm">
      <Save className="h-4 w-4 mr-1" />
      {saving ? 'Guardando...' : 'Guardar'}
    </Button>
  </div>
);
