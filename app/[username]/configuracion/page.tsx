import { Settings } from 'lucide-react';

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
      <Settings className="h-16 w-16 mb-4" />
      <h2 className="text-xl font-semibold">Configuración</h2>
      <p>Panel de configuración en desarrollo.</p>
    </div>
  );
}
