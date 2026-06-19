'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChartData } from '@/types';

interface Props {
  onInsert: (data: ChartData) => void;
  onClose: () => void;
}

export const ChartModal = ({ onInsert, onClose }: Props) => {
  const [type, setType] = useState<'bar' | 'line' | 'pie' | 'doughnut' | 'radar'>('bar');
  const [labels, setLabels] = useState('Enero,Febrero,Marzo');
  const [values, setValues] = useState('100,200,150');

  const handleInsert = () => {
    const data: ChartData = {
      type,
      labels: labels.split(',').map(l => l.trim()),
      datasets: [{
        label: 'Datos',
        data: values.split(',').map(v => parseFloat(v.trim()) || 0),
        backgroundColor: ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#1d4ed8', '#0891b2', '#059669', '#d97706', '#dc2626'],
      }],
    };
    onInsert(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insertar gráfico</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tipo de gráfico</Label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full h-10 rounded border px-3 text-sm bg-background"
            >
              <option value="bar">Barras</option>
              <option value="line">Líneas</option>
              <option value="pie">Circular</option>
              <option value="doughnut">Dona</option>
              <option value="radar">Radar</option>
            </select>
          </div>
          <div>
            <Label>Etiquetas (separadas por coma)</Label>
            <Input value={labels} onChange={e => setLabels(e.target.value)} />
          </div>
          <div>
            <Label>Valores (separados por coma)</Label>
            <Input value={values} onChange={e => setValues(e.target.value)} />
          </div>
          <Button onClick={handleInsert} variant="gradient" className="w-full">
            Insertar gráfico
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
