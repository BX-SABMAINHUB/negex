'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { createProject } from '@/lib/firestore';

export const CodeRedeemer = () => {
  const { user, userData } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('Introduce un código válido');
      return;
    }
    if (!user) {
      toast.error('Debes iniciar sesión para canjear un código');
      return;
    }

    setLoading(true);
    // 1. Esperar exactamente 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      // 2. Obtener el almacén de códigos
      const store = (window as any).__templateCodeStore as Map<string, { template: any; timestamp: number }>;
      const entry = store?.get(code.trim().toUpperCase());
      if (!entry) {
        toast.error('Código no válido o expirado');
        return;
      }
      if (Date.now() - entry.timestamp > 10 * 60 * 1000) {
        toast.error('El código ha expirado');
        store.delete(code);
        return;
      }

      const template = entry.template;
      const username = userData?.username || user.email?.split('@')[0] || 'usuario';

      // 3. Crear proyecto público
      const projectId = await createProject(user.uid, {
        username,
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        plantillaTipo: template.category,
        plantillaId: template.id,
        canvasData: template.defaultCanvasData || { version: '5.3.0', objects: [], background: '#ffffff' },
        thumbnailUrl: '',
        isPublic: true,
      });

      // 4. Generar enlace
      const link = `https://negex.vercel.app/negexusercontent/${projectId}`;
      toast.success(`Proyecto creado. Enlace: ${link}`, { duration: 15000 });
      await navigator.clipboard.writeText(link);
      toast.info('Enlace copiado al portapapeles. Ábrelo en tu navegador.');

      // 5. Limpiar código usado
      store.delete(code);
      setCode('');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-lg">Canjear código de plantilla</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Ej: VERT-1234"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            disabled={loading}
            className="font-mono text-center text-lg tracking-widest"
            maxLength={10}
          />
          <Button
            variant="gradient"
            onClick={handleRedeem}
            disabled={loading || !code.trim()}
            className="min-w-[140px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Canjeando...
              </span>
            ) : (
              'Canjear'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
