'use client';
import { fabric } from 'fabric';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { PaintBucket, Type, Image, Move } from 'lucide-react';

interface Props {
  selectedObject: fabric.Object | null;
  onUpdate: (prop: string, value: any) => void;
  canvas: fabric.Canvas | null;
}

export const PropertiesPanel = ({ selectedObject, onUpdate }: Props) => {
  if (!selectedObject) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Selecciona un objeto para editar sus propiedades
      </div>
    );
  }

  const isText = selectedObject instanceof fabric.IText || selectedObject instanceof fabric.Textbox;

  return (
    <div className="border-b">
      <Tabs defaultValue="style" className="p-3">
        <TabsList className="w-full">
          <TabsTrigger value="style" className="flex-1"><PaintBucket className="h-3 w-3 mr-1" /> Estilo</TabsTrigger>
          {isText && <TabsTrigger value="text" className="flex-1"><Type className="h-3 w-3 mr-1" /> Texto</TabsTrigger>}
          <TabsTrigger value="position" className="flex-1"><Move className="h-3 w-3 mr-1" /> Posición</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="space-y-3 pt-3">
          <div className="space-y-1">
            <Label className="text-xs">Color de relleno</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={(selectedObject as any).fill || '#000000'}
                onChange={e => onUpdate('fill', e.target.value)}
                className="w-10 h-8 p-0 border-0"
              />
              <Input
                value={(selectedObject as any).fill || ''}
                onChange={e => onUpdate('fill', e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Opacidad</Label>
            <Slider
              value={[((selectedObject as any).opacity ?? 1) * 100]}
              onValueChange={([v]) => onUpdate('opacity', v / 100)}
              min={0} max={100} step={1}
            />
          </div>
          {(selectedObject as any).stroke !== undefined && (
            <div className="space-y-1">
              <Label className="text-xs">Color de borde</Label>
              <Input
                type="color"
                value={(selectedObject as any).stroke || '#000000'}
                onChange={e => onUpdate('stroke', e.target.value)}
                className="w-10 h-8 p-0"
              />
            </div>
          )}
        </TabsContent>

        {isText && (
          <TabsContent value="text" className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label className="text-xs">Tamaño de fuente</Label>
              <Input
                type="number"
                value={(selectedObject as any).fontSize || 24}
                onChange={e => onUpdate('fontSize', parseInt(e.target.value) || 24)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Familia tipográfica</Label>
              <select
                value={(selectedObject as any).fontFamily || 'Inter'}
                onChange={e => onUpdate('fontFamily', e.target.value)}
                className="w-full h-8 rounded border text-xs px-2 bg-background"
              >
                <option value="Inter">Inter</option>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
              </select>
            </div>
            <div className="flex gap-1">
              <Button
                variant={(selectedObject as any).fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate('fontWeight', (selectedObject as any).fontWeight === 'bold' ? 'normal' : 'bold')}
              >
                <strong>B</strong>
              </Button>
              <Button
                variant={(selectedObject as any).fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate('fontStyle', (selectedObject as any).fontStyle === 'italic' ? 'normal' : 'italic')}
              >
                <em>I</em>
              </Button>
              <Button
                variant={(selectedObject as any).underline ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdate('underline', !(selectedObject as any).underline)}
              >
                <u>U</u>
              </Button>
            </div>
          </TabsContent>
        )}

        <TabsContent value="position" className="space-y-3 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={Math.round((selectedObject as any).left || 0)}
                onChange={e => onUpdate('left', parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={Math.round((selectedObject as any).top || 0)}
                onChange={e => onUpdate('top', parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Ancho</Label>
              <Input
                type="number"
                value={Math.round(((selectedObject as any).width || 1) * ((selectedObject as any).scaleX || 1))}
                onChange={e => {
                  const w = parseFloat(e.target.value);
                  const scale = w / ((selectedObject as any).width || 1);
                  onUpdate('scaleX', scale);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Alto</Label>
              <Input
                type="number"
                value={Math.round(((selectedObject as any).height || 1) * ((selectedObject as any).scaleY || 1))}
                onChange={e => {
                  const h = parseFloat(e.target.value);
                  const scale = h / ((selectedObject as any).height || 1);
                  onUpdate('scaleY', scale);
                }}
                className="h-8 text-xs"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Rotación</Label>
              <Input
                type="number"
                value={Math.round((selectedObject as any).angle || 0)}
                onChange={e => onUpdate('angle', parseFloat(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
