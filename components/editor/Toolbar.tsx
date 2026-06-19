'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Undo2, Redo2, Type, Square, Circle, Triangle, Minus, Star, Image,
  BarChart3, Table2, Smile, Download, Save, ZoomIn, ZoomOut, Trash2,
  Eye, FileText
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ToolType } from '@/types';

interface ToolbarProps {
  projectTitle: string;
  onTitleChange: (title: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddText: () => void;
  onAddShape: (type: string) => void;
  onOpenImages: () => void;
  onOpenCharts: () => void;
  onOpenTables: () => void;
  onToggleSymbols: () => void;
  onExport: () => void;
  saving: boolean;
  onSave: () => void;
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onDelete: () => void;
}

export const Toolbar = ({
  projectTitle, onTitleChange, zoom, onZoomChange,
  canUndo, canRedo, onUndo, onRedo,
  onAddText, onAddShape, onOpenImages, onOpenCharts, onOpenTables,
  onToggleSymbols, onExport, saving, onSave, onDelete,
}: ToolbarProps) => {
  const [editingTitle, setEditingTitle] = useState(false);

  return (
    <TooltipProvider>
      <div className="h-14 border-b bg-background/95 backdrop-blur flex items-center gap-1 px-3 overflow-x-auto shrink-0">
        <div className="flex items-center gap-2 min-w-fit">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white font-bold text-xs">N</div>
          {editingTitle ? (
            <input
              value={projectTitle}
              onChange={e => onTitleChange(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
              className="text-sm font-medium bg-transparent border-b border-primary outline-none max-w-[200px]"
            />
          ) : (
            <button onClick={() => setEditingTitle(true)} className="text-sm font-medium hover:text-primary truncate max-w-[200px]">
              {projectTitle || 'Sin título'}
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <div className="flex items-center gap-0.5">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo}><Undo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Deshacer</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo}><Redo2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Rehacer</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Eliminar</TooltipContent></Tooltip>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <div className="flex items-center gap-0.5">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onAddText}><Type className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Texto</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onAddShape('rect')}><Square className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Rectángulo</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onAddShape('circle')}><Circle className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Círculo</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onAddShape('triangle')}><Triangle className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Triángulo</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onAddShape('line')}><Minus className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Línea</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => onAddShape('star')}><Star className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Estrella</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onOpenImages}><Image className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Imagen</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onOpenCharts}><BarChart3 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Gráfico</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onOpenTables}><Table2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Tabla</TooltipContent></Tooltip>
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={onToggleSymbols}><Smile className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Símbolos</TooltipContent></Tooltip>
        </div>

        <div className="h-6 w-px bg-border mx-2" />

        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.max(25, zoom - 10))}><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-xs w-12 text-center font-mono">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={() => onZoomChange(Math.min(400, zoom + 10))}><ZoomIn className="h-4 w-4" /></Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Vista previa</TooltipContent></Tooltip>
          <Button variant="outline" size="sm" onClick={onExport}><Download className="h-4 w-4 mr-1" /> Exportar</Button>
          <Button variant="gradient" size="sm" onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};
