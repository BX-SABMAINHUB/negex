'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useCanvasHistory } from '@/hooks/useCanvasHistory';
import { Toolbar } from './Toolbar';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { SymbolPanel } from './SymbolPanel';
import { ChartModal } from './ChartModal';
import { TableModal } from './TableModal';
import { ImageSearchModal } from './ImageSearchModal';
import { ExportModal } from './ExportModal';
import { ToolType } from '@/types';
import { toast } from 'sonner';

interface CanvasEditorProps {
  initialData?: any;
  onSave: (json: object, thumbnail: string) => Promise<void>;
  width?: number;
  height?: number;
  projectTitle: string;
  onTitleChange: (title: string) => void;
  projectId: string;
}

// Lienzo vacío seguro (Fabric v5)
const BLANK_CANVAS = {
  version: '5.3.0',
  objects: [],
  background: '#ffffff',
};

/**
 * Sanea cualquier JSON de lienzo y devuelve uno que Fabric.js siempre puede cargar.
 * Se asegura de que las propiedades de texto y fuentes sean strings para evitar
 * "undefined is not an object (evaluating 'n.indexOf')".
 */
function sanitizeCanvasData(raw: any): object {
  // 1. Si no hay datos o son nulos → lienzo vacío
  if (!raw) return BLANK_CANVAS;

  // 2. Si es string, intentar parsear
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return BLANK_CANVAS;
    }
  }

  // 3. Validar estructura básica
  if (
    typeof raw !== 'object' ||
    Array.isArray(raw) ||
    raw === null ||
    typeof raw.version !== 'string' ||
    !Array.isArray(raw.objects)
  ) {
    return BLANK_CANVAS;
  }

  // 4. Procesar cada objeto del array
  const cleanedObjects = raw.objects
    .filter((obj: any) => obj && typeof obj === 'object' && typeof obj.type === 'string')
    .map((obj: any) => {
      const clean: any = { type: obj.type };

      // Copiar solo propiedades seguras, forzando strings donde sea necesario
      if (typeof obj.left === 'number') clean.left = obj.left;
      if (typeof obj.top === 'number') clean.top = obj.top;
      if (typeof obj.width === 'number') clean.width = obj.width;
      if (typeof obj.height === 'number') clean.height = obj.height;
      if (typeof obj.scaleX === 'number') clean.scaleX = obj.scaleX;
      if (typeof obj.scaleY === 'number') clean.scaleY = obj.scaleY;
      if (typeof obj.angle === 'number') clean.angle = obj.angle;
      if (typeof obj.opacity === 'number') clean.opacity = obj.opacity;
      if (typeof obj.fill === 'string') clean.fill = obj.fill;
      if (typeof obj.stroke === 'string') clean.stroke = obj.stroke;
      if (typeof obj.strokeWidth === 'number') clean.strokeWidth = obj.strokeWidth;
      if (typeof obj.rx === 'number') clean.rx = obj.rx;
      if (typeof obj.ry === 'number') clean.ry = obj.ry;
      if (typeof obj.radius === 'number') clean.radius = obj.radius;
      if (obj.points && Array.isArray(obj.points)) clean.points = obj.points;
      if (typeof obj.x1 === 'number') clean.x1 = obj.x1;
      if (typeof obj.y1 === 'number') clean.y1 = obj.y1;
      if (typeof obj.x2 === 'number') clean.x2 = obj.x2;
      if (typeof obj.y2 === 'number') clean.y2 = obj.y2;

      // Propiedades de texto: ¡forzar strings!
      if (clean.type === 'i-text' || clean.type === 'text' || clean.type === 'textbox') {
        clean.text = typeof obj.text === 'string' ? obj.text : '';
        clean.fontFamily = typeof obj.fontFamily === 'string' ? obj.fontFamily : 'Inter';
        clean.fontSize = typeof obj.fontSize === 'number' ? obj.fontSize : 24;
        clean.fontWeight = typeof obj.fontWeight === 'string' ? obj.fontWeight : 'normal';
        clean.fontStyle = typeof obj.fontStyle === 'string' ? obj.fontStyle : 'normal';
        clean.textAlign = typeof obj.textAlign === 'string' ? obj.textAlign : 'left';
        clean.lineHeight = typeof obj.lineHeight === 'number' ? obj.lineHeight : 1.2;
        clean.underline = typeof obj.underline === 'boolean' ? obj.underline : false;
      } else {
        // Para otros objetos, si tienen fontFamily, asegurar string
        if (obj.fontFamily !== undefined) {
          clean.fontFamily = typeof obj.fontFamily === 'string' ? obj.fontFamily : 'Inter';
        }
      }

      // Selectable / evented / visible
      if (typeof obj.selectable === 'boolean') clean.selectable = obj.selectable;
      if (typeof obj.evented === 'boolean') clean.evented = obj.evented;
      if (typeof obj.visible === 'boolean') clean.visible = obj.visible;

      // Bloqueos
      if (typeof obj.lockMovementX === 'boolean') clean.lockMovementX = obj.lockMovementX;
      if (typeof obj.lockMovementY === 'boolean') clean.lockMovementY = obj.lockMovementY;
      if (typeof obj.lockRotation === 'boolean') clean.lockRotation = obj.lockRotation;
      if (typeof obj.lockScalingX === 'boolean') clean.lockScalingX = obj.lockScalingX;
      if (typeof obj.lockScalingY === 'boolean') clean.lockScalingY = obj.lockScalingY;

      // Imágenes
      if (typeof obj.src === 'string') clean.src = obj.src;

      return clean;
    });

  return {
    version: raw.version,
    objects: cleanedObjects,
    background: typeof raw.background === 'string' ? raw.background : '#ffffff',
  };
}

// ----------------------------------------------------------------
// Componente CanvasEditor
// ----------------------------------------------------------------

export const CanvasEditor = ({
  initialData,
  onSave,
  width = 1080,
  height = 1920,
  projectTitle,
  onTitleChange,
  projectId,
}: CanvasEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const { pushState, undo, redo, canUndo, canRedo } = useCanvasHistory();

  // Inicialización absolutamente segura
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    let canvas: fabric.Canvas;
    try {
      canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
        selection: true,
        stopContextMenu: true,
        fireRightClick: true,
      });
      fabricRef.current = canvas;
    } catch (err: any) {
      console.error('Error creando canvas:', err);
      setInitError('No se pudo crear el lienzo. Fabric.js no está disponible.');
      return;
    }

    const safeData = sanitizeCanvasData(initialData);

    try {
      canvas.loadFromJSON(safeData, () => {
        canvas.renderAll();
        pushState(JSON.stringify(canvas.toJSON()));
        setCanvasReady(true);
      });
    } catch (err: any) {
      console.warn('Error en loadFromJSON, se usará lienzo vacío:', err);
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
      pushState(JSON.stringify(canvas.toJSON()));
      setCanvasReady(true);
      toast.error('La plantilla tenía datos corruptos. Se abrió un lienzo en blanco.');
    }

    // Eventos de selección
    canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));
    canvas.on('object:modified', () => pushState(JSON.stringify(canvas.toJSON())));

    // Zoom con rueda
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom() * (delta > 0 ? 0.95 : 1.05);
      newZoom = Math.min(Math.max(newZoom, 0.25), 4);
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(Math.round(newZoom * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Atajos de teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        const prev = undo();
        if (prev) {
          try { canvas.loadFromJSON(JSON.parse(prev), () => canvas.renderAll()); } catch {}
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        const next = redo();
        if (next) {
          try { canvas.loadFromJSON(JSON.parse(next), () => canvas.renderAll()); } catch {}
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active) {
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
          pushState(JSON.stringify(canvas.toJSON()));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [width, height]);

  // ----------------------------------------------------------------
  // Funciones de manipulación (idénticas a versiones anteriores)
  // ----------------------------------------------------------------
  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText('Escribe aquí', {
      left: (canvas.width ?? 1080) / 2 - 50,
      top: (canvas.height ?? 1920) / 2 - 20,
      fontFamily: 'Inter',
      fontSize: 32,
      fill: '#000000',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    pushState(JSON.stringify(canvas.toJSON()));
    canvas.renderAll();
  };

  const addShape = (type: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    let shape: fabric.Object;
    const center = { left: (canvas.width ?? 1080) / 2 - 50, top: (canvas.height ?? 1920) / 2 - 50 };
    switch (type) {
      case 'rect': shape = new fabric.Rect({ ...center, width: 100, height: 100, fill: '#2563EB' }); break;
      case 'circle': shape = new fabric.Circle({ left: center.left, top: center.top, radius: 50, fill: '#06B6D4' }); break;
      case 'triangle': shape = new fabric.Triangle({ ...center, width: 100, height: 100, fill: '#10B981' }); break;
      case 'line': shape = new fabric.Line([50, 50, 200, 50], { stroke: '#000', strokeWidth: 3 }); break;
      case 'star': {
        const points = [];
        const outerR = 50, innerR = 20, spikes = 5;
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          points.push({ x: center.left + 50 + r * Math.cos(angle), y: center.top + 50 + r * Math.sin(angle) });
        }
        shape = new fabric.Polygon(points, { fill: '#F59E0B' });
        break;
      }
      default: return;
    }
    canvas.add(shape);
    canvas.setActiveObject(shape);
    pushState(JSON.stringify(canvas.toJSON()));
    canvas.renderAll();
  };

  const addImageFromURL = (url: string) => { /* ... idéntico ... */ };
  const addSymbol = (symbol: string) => { /* ... */ };
  const handleSave = async () => { /* ... */ };
  const updateObjectProperty = (prop: string, value: any) => { /* ... */ };
  const deleteSelected = () => { /* ... */ };

  if (initError) { /* ... mismo render de error ... */ }
  if (!canvasReady) { /* ... spinner ... */ }

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-950">
      {/* Toolbar y paneles, igual que antes */}
    </div>
  );
};
