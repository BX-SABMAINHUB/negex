'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const CodeRedeemer = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('Introduce un código válido');
      return;
    }

    setLoading(true);
    // Esperar exactamente 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));

    try {
      const redeem = (window as any).__redeemTemplateCode;
      if (typeof redeem !== 'function') {
        toast.error('El sistema de canje no está disponible. Recarga la página.');
        setLoading(false);
        return;
      }
      const success = await redeem(code.trim().toUpperCase());
      if (success) {
        setCode('');
        // La redirección la maneja redeemCode
      }
      // Si no tiene éxito, redeem ya mostró toast
    } catch (err) {
      console.error(err);
      toast.error('Error al canjear el código');
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
