'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fabric } from 'fabric';
import { Download, Clipboard, FileImage, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface Props {
  canvas: fabric.Canvas | null;
  onClose: () => void;
}

export const ExportModal = ({ canvas, onClose }: Props) => {
  const exportPNG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    download(dataURL, 'proyecto.png');
    onClose();
  };

  const exportJPG = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
    download(dataURL, 'proyecto.jpg');
    onClose();
  };

  const exportPDF = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    const pdf = new jsPDF({
      orientation: canvas.width! > canvas.height! ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width!, canvas.height!],
    });
    pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width!, canvas.height!);
    pdf.save('proyecto.pdf');
    onClose();
  };

  const copyToClipboard = async () => {
    if (!canvas) return;
    const blob = await new Promise<Blob>((resolve) =>
      (canvas.getElement() as HTMLCanvasElement).toBlob((b) => resolve(b!), 'image/png')
    );
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    toast.success('Imagen copiada al portapapeles');
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Exportar proyecto</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={exportPNG} className="flex-col h-24 gap-2">
            <FileImage className="h-8 w-8" /> PNG (2x)
          </Button>
          <Button variant="outline" onClick={exportJPG} className="flex-col h-24 gap-2">
            <FileImage className="h-8 w-8" /> JPG
          </Button>
          <Button variant="outline" onClick={exportPDF} className="flex-col h-24 gap-2">
            <FileText className="h-8 w-8" /> PDF
          </Button>
          <Button variant="outline" onClick={copyToClipboard} className="flex-col h-24 gap-2">
            <Clipboard className="h-8 w-8" /> Copiar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const download = (dataURL: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  link.click();
};
