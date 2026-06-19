'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableData } from '@/types';

interface Props {
  onInsert: (data: TableData) => void;
  onClose: () => void;
}

export const TableModal = ({ onInsert, onClose }: Props) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    const cells = Array.from({ length: rows }, () => Array(cols).fill(''));
    const formulas = Array.from({ length: rows }, () => Array(cols).fill(''));
    onInsert({ rows, cols, cells, formulas });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Insertar tabla</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Filas</Label>
              <Input type="number" value={rows} onChange={e => setRows(parseInt(e.target.value) || 1)} min={1} max={20} />
            </div>
            <div>
              <Label>Columnas</Label>
              <Input type="number" value={cols} onChange={e => setCols(parseInt(e.target.value) || 1)} min={1} max={10} />
            </div>
          </div>
          <Button onClick={handleInsert} variant="gradient" className="w-full">Insertar tabla</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
