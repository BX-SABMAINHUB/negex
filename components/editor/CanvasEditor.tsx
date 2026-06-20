'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

// ----------------------------------------------------------------
// Tipos y constantes
// ----------------------------------------------------------------

interface CanvasEditorProps {
  initialData?: any;
  onSave: (json: object, thumbnail: string) => Promise<void>;
  width?: number;
  height?: number;
  projectTitle: string;
  onTitleChange: (title: string) => void;
  projectId: string;
}

// Lienzo vacío que Fabric.js siempre puede cargar
const BLANK_CANVAS = {
  version: '5.3.0',
  objects: [],
  background: '#ffffff',
};

// ----------------------------------------------------------------
// Validación segura de los datos del lienzo
// ----------------------------------------------------------------

function safeParseCanvasData(raw: any): object {
  // Si ya es un objeto con la estructura esperada, lo devolvemos tal cual
  if (
    raw &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    typeof raw.version === 'string' &&
    Array.isArray(raw.objects)
  ) {
    return raw;
  }

  // Si es un string, intentamos parsearlo
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        typeof parsed.version === 'string' &&
        Array.isArray(parsed.objects)
      ) {
        return parsed;
      }
    } catch {
      // Error de parseo → lienzo vacío
    }
  }

  // Cualquier otro caso → lienzo vacío
  return BLANK_CANVAS;
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

  const { pushState, undo, redo, canUndo, canRedo } = useCanvasHistory();

  // ----------------------------------------------------------------
  // Inicialización del lienzo (solo una vez)
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    // Crear canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      stopContextMenu: true,
      fireRightClick: true,
    });

    fabricRef.current = canvas;

    // Obtener datos seguros
    const jsonToLoad = safeParseCanvasData(initialData);

    // Cargar sin miedo a errores
    try {
      canvas.loadFromJSON(jsonToLoad, () => {
        canvas.renderAll();
        pushState(JSON.stringify(canvas.toJSON()));
      });
    } catch (error) {
      console.error('Error al cargar datos en el lienzo, usando vacío:', error);
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      canvas.renderAll();
      pushState(JSON.stringify(canvas.toJSON()));
    }

    // Eventos de selección
    canvas.on('selection:created', (e) =>
      setSelectedObject(e.selected?.[0] || null)
    );
    canvas.on('selection:updated', (e) =>
      setSelectedObject(e.selected?.[0] || null)
    );
    canvas.on('selection:cleared', () => setSelectedObject(null));

    // Guardar estado tras modificación
    canvas.on('object:modified', () => {
      pushState(JSON.stringify(canvas.toJSON()));
    });

    // Zoom con rueda del ratón
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom() * (delta > 0 ? 0.95 : 1.05);
      newZoom = Math.min(Math.max(newZoom, 0.25), 4);
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(Math.round(newZoom * 100));
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Atajos de teclado globales
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        const prev = undo();
        if (prev) {
          try {
            canvas.loadFromJSON(JSON.parse(prev), () => canvas.renderAll());
          } catch {}
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        const next = redo();
        if (next) {
          try {
            canvas.loadFromJSON(JSON.parse(next), () => canvas.renderAll());
          } catch {}
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
  }, [width, height]); // ✅ solo depende de dimensiones

  // ----------------------------------------------------------------
  // Funciones de manipulación del lienzo
  // ----------------------------------------------------------------

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText('Escribe aquí', {
      left: canvas.width! / 2 - 50,
      top: canvas.height! / 2 - 20,
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
    const center = { left: canvas.width! / 2 - 50, top: canvas.height! / 2 - 50 };

    switch (type) {
      case 'rect':
        shape = new fabric.Rect({ ...center, width: 100, height: 100, fill: '#2563EB' });
        break;
      case 'circle':
        shape = new fabric.Circle({ left: center.left, top: center.top, radius: 50, fill: '#06B6D4' });
        break;
      case 'triangle':
        shape = new fabric.Triangle({ ...center, width: 100, height: 100, fill: '#10B981' });
        break;
      case 'line':
        shape = new fabric.Line([50, 50, 200, 50], { stroke: '#000', strokeWidth: 3 });
        break;
      case 'star': {
        const points = [];
        const outerR = 50, innerR = 20, spikes = 5;
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / spikes) * i - Math.PI / 2;
          points.push({
            x: center.left + 50 + r * Math.cos(angle),
            y: center.top + 50 + r * Math.sin(angle),
          });
        }
        shape = new fabric.Polygon(points, { fill: '#F59E0B' });
        break;
      }
      default:
        return;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    pushState(JSON.stringify(canvas.toJSON()));
    canvas.renderAll();
  };

  const addImageFromURL = (url: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    fabric.Image.fromURL(url, (img: fabric.Image) => {
      if (!img) return;
      img.scaleToWidth(300);
      img.set({ left: canvas.width! / 2 - 150, top: canvas.height! / 2 - 150 });
      canvas.add(img);
      canvas.setActiveObject(img);
      pushState(JSON.stringify(canvas.toJSON()));
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  };

  const addSymbol = (symbol: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText(symbol, {
      left: canvas.width! / 2 - 20,
      top: canvas.height! / 2 - 20,
      fontFamily: 'Inter',
      fontSize: 48,
      fill: '#000000',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    pushState(JSON.stringify(canvas.toJSON()));
    canvas.renderAll();
  };

  const handleSave = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const json = canvas.toJSON();
      const thumbnail = canvas.toDataURL({ format: 'png', multiplier: 0.5 });
      await onSave(json, thumbnail);
      toast.success('Proyecto guardado');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateObjectProperty = (prop: string, value: any) => {
    const obj = fabricRef.current?.getActiveObject();
    if (!obj) return;
    obj.set(prop as any, value);
    fabricRef.current?.renderAll();
    pushState(JSON.stringify(fabricRef.current?.toJSON()));
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.remove(obj);
      canvas.discardActiveObject();
      canvas.renderAll();
      pushState(JSON.stringify(canvas.toJSON()));
    }
  };

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <Toolbar
        projectTitle={projectTitle}
        onTitleChange={onTitleChange}
        zoom={zoom}
        onZoomChange={(z) => {
          const canvas = fabricRef.current;
          if (canvas) {
            const c = canvas.getCenter();
            canvas.zoomToPoint({ x: c.left, y: c.top }, z / 100);
            setZoom(z);
          }
        }}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          const prev = undo();
          if (prev && fabricRef.current) {
            try {
              fabricRef.current.loadFromJSON(JSON.parse(prev), () =>
                fabricRef.current?.renderAll()
              );
            } catch {}
          }
        }}
        onRedo={() => {
          const next = redo();
          if (next && fabricRef.current) {
            try {
              fabricRef.current.loadFromJSON(JSON.parse(next), () =>
                fabricRef.current?.renderAll()
              );
            } catch {}
          }
        }}
        onAddText={addText}
        onAddShape={addShape}
        onOpenImages={() => setShowImageModal(true)}
        onOpenCharts={() => setShowChartModal(true)}
        onOpenTables={() => setShowTableModal(true)}
        onToggleSymbols={() => setShowSymbols(!showSymbols)}
        onExport={() => setShowExportModal(true)}
        saving={saving}
        onSave={handleSave}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onDelete={deleteSelected}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          <div className="absolute inset-0 flex items-center justify-center bg-[#e5e7eb] dark:bg-[#1e293b] bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(circle,#334155_1px,transparent_1px)] bg-[size:20px_20px]">
            <div
              className="shadow-2xl"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>

        <div className="w-72 border-l bg-background overflow-y-auto flex flex-col">
          <PropertiesPanel
            selectedObject={selectedObject}
            onUpdate={updateObjectProperty}
            canvas={fabricRef.current}
          />
          <LayersPanel
            canvas={fabricRef.current}
            onUpdate={() => {
              fabricRef.current?.renderAll();
              pushState(JSON.stringify(fabricRef.current?.toJSON()));
            }}
          />
        </div>
      </div>

      {showSymbols && (
        <SymbolPanel onSelect={addSymbol} onClose={() => setShowSymbols(false)} />
      )}

      {showChartModal && (
        <ChartModal
          onInsert={(chartData) => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const text = new fabric.IText('📊 Gráfico: ' + chartData.type, {
              left: canvas.width! / 2 - 100,
              top: canvas.height! / 2 - 30,
              fontSize: 24,
              fill: '#2563EB',
            });
            (text as any).chartData = chartData;
            canvas.add(text);
            pushState(JSON.stringify(canvas.toJSON()));
            canvas.renderAll();
            setShowChartModal(false);
          }}
          onClose={() => setShowChartModal(false)}
        />
      )}

      {showTableModal && (
        <TableModal
          onInsert={(tableData) => {
            const canvas = fabricRef.current;
            if (!canvas) return;
            const text = new fabric.IText('📋 Tabla de datos', {
              left: canvas.width! / 2 - 100,
              top: canvas.height! / 2 - 30,
              fontSize: 24,
              fill: '#06B6D4',
            });
            (text as any).tableData = tableData;
            canvas.add(text);
            pushState(JSON.stringify(canvas.toJSON()));
            canvas.renderAll();
            setShowTableModal(false);
          }}
          onClose={() => setShowTableModal(false)}
        />
      )}

      {showImageModal && (
        <ImageSearchModal
          onSelect={addImageFromURL}
          onClose={() => setShowImageModal(false)}
        />
      )}

      {showExportModal && (
        <ExportModal canvas={fabricRef.current} onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
};
