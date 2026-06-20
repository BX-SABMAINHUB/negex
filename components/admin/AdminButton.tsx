'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createPlantilla } from '@/lib/firestore';

export default function AdminButton() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [plantillaName, setPlantillaName] = useState('');
  const [plantillaJSON, setPlantillaJSON] = useState('');

  const handlePasswordSubmit = () => {
    if (password === 'Owner') {
      setAuthenticated(true);
      setShowPassword(false);
      setShowPanel(true);
      setPassword('');
    } else {
      toast.error('Contraseña incorrecta');
      setPassword('');
      setShowPassword(false);
    }
  };

  const handlePublish = async () => {
    if (!plantillaName.trim()) {
      toast.error('Debes poner un nombre a la plantilla');
      return;
    }
    let jsonData;
    try {
      jsonData = JSON.parse(plantillaJSON);
    } catch {
      toast.error('El JSON no es válido. Revisa la sintaxis.');
      return;
    }

    try {
      await createPlantilla({
        name: plantillaName.trim(),
        defaultCanvasData: jsonData,
      });
      toast.success('¡Plantilla publicada!');
      setPlantillaName('');
      setPlantillaJSON('');
      setShowPanel(false);
      setAuthenticated(false);
    } catch (err) {
      toast.error('Error al publicar la plantilla');
      console.error(err);
    }
  };

  return (
    <>
      {/* Botón flotante + */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-lg hover:shadow-xl flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPassword(true)}
        aria-label="Añadir plantilla (admin)"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Modal de contraseña */}
      <Dialog open={showPassword} onOpenChange={setShowPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contraseña de administrador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Escribe la contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <Button onClick={handlePasswordSubmit} className="w-full" variant="gradient">
              Acceder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Panel para crear la plantilla */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 z-50 w-96 bg-card border rounded-xl shadow-2xl p-6 space-y-4"
          >
            <h3 className="text-lg font-bold">Crear plantilla</h3>
            <div>
              <Label htmlFor="plantillaName">Nombre de la plantilla</Label>
              <Input
                id="plantillaName"
                value={plantillaName}
                onChange={(e) => setPlantillaName(e.target.value)}
                placeholder="Ej: Mi plantilla personalizada"
              />
            </div>
            <div>
              <Label htmlFor="plantillaJSON">Código de programación (JSON)</Label>
              <textarea
                id="plantillaJSON"
                value={plantillaJSON}
                onChange={(e) => setPlantillaJSON(e.target.value)}
                className="w-full h-40 p-2 text-sm font-mono border rounded-md bg-muted resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder='Pega aquí el JSON de la plantilla... {"version":"5.3.0","objects":[...]}'
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setShowPanel(false); setAuthenticated(false); }}>Cancelar</Button>
              <Button variant="gradient" className="flex-1" onClick={handlePublish}>
                Publicar plantilla
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
