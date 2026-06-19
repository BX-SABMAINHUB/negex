import { FileX } from 'lucide-react';

export default function PapeleraPage() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
      <FileX className="h-16 w-16 mb-4" />
      <h2 className="text-xl font-semibold">Papelera</h2>
      <p>Aquí aparecerán los proyectos eliminados.</p>
    </div>
  );
}
