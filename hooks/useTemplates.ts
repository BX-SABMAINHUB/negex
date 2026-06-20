'use client';
import { useState, useEffect } from 'react';
import { Plantilla, PlantillaCategoria } from '@/types';
import { getTemplates } from '@/lib/firestore';
import { toast } from 'sonner';

export const useTemplates = (category?: PlantillaCategoria) => {
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTemplates(category);
      setTemplates(data);
    } catch (err: any) {
      console.error('Error al obtener plantillas:', err);
      setError('No se pudieron cargar las plantillas.');
      toast.error('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  return { templates, loading, error, refetch: fetchTemplates };
};
