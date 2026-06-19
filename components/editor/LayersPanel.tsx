'use client';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Props {
  canvas: fabric.Canvas | null;
  onUpdate: () => void;
}

export const LayersPanel = ({ canvas, onUpdate }: Props) => {
  const [objects, setObjects] = useState<fabric.Object[]>([]);

  useEffect(() => {
    if (!canvas) return;
    const update = () => setObjects([...canvas.getObjects()].reverse());
    canvas.on('object:added', update);
    canvas.on('object:removed', update);
    canvas.on('object:modified', update);
    update();
    return () => {
      canvas.off('object:added', update);
      canvas.off('object:removed', update);
      canvas.off('object:modified', update);
    };
  }, [canvas]);

  const toggleVisibility = (obj: fabric.Object) => {
    obj.set('visible', !obj.visible);
    canvas?.renderAll();
    onUpdate();
  };

  const toggleLock = (obj: fabric.Object) => {
    obj.set('lockMovementX', !obj.lockMovementX);
    obj.set('lockMovementY', !obj.lockMovementY);
    obj.set('lockRotation', !obj.lockRotation);
    obj.set('lockScalingX', !obj.lockScalingX);
    obj.set('lockScalingY', !obj.lockScalingY);
    onUpdate();
  };

  const deleteObj = (obj: fabric.Object) => {
    canvas?.remove(obj);
    onUpdate();
  };

  const selectObj = (obj: fabric.Object) => {
    canvas?.setActiveObject(obj);
    canvas?.renderAll();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const actualIndex = objects.length - 1 - index;
    const obj = canvas?.getObjects()[actualIndex];
    if (obj) {
      canvas?.moveTo(obj, actualIndex + 1);
      canvas?.renderAll();
      onUpdate();
      setObjects([...canvas!.getObjects()].reverse());
    }
  };

  const moveDown = (index: number) => {
    if (index === objects.length - 1) return;
    const actualIndex = objects.length - 1 - index;
    const obj = canvas?.getObjects()[actualIndex];
    if (obj) {
      canvas?.moveTo(obj, actualIndex - 1);
      canvas?.renderAll();
      onUpdate();
      setObjects([...canvas!.getObjects()].reverse());
    }
  };

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <GripVertical className="h-4 w-4" /> Capas
      </h3>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {objects.map((obj, i) => (
          <div
            key={i}
            className="flex items-center gap-1 p-1.5 rounded hover:bg-accent cursor-pointer text-xs"
            onClick={() => selectObj(obj)}
          >
            <span className="w-5 text-center text-muted-foreground">{objects.length - i}</span>
            <span className="flex-1 truncate">
              {obj instanceof fabric.IText ? (obj as fabric.IText).text?.slice(0, 20) || 'Texto' :
               obj instanceof fabric.Rect ? 'Rectángulo' :
               obj instanceof fabric.Circle ? 'Círculo' :
               obj instanceof fabric.Triangle ? 'Triángulo' :
               obj instanceof fabric.Line ? 'Línea' :
               obj instanceof fabric.Polygon ? 'Estrella' :
               obj instanceof fabric.FabricImage ? 'Imagen' : 'Objeto'}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleVisibility(obj); }}>
              {obj.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); toggleLock(obj); }}>
              {obj.lockMovementX ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveUp(i); }}>▲</Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveDown(i); }}>▼</Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); deleteObj(obj); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
