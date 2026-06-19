'use client';
import { useState, useEffect } from 'react';
import { Plantilla, PlantillaCategoria } from '@/types';
import { getTemplates } from '@/lib/firestore';

export const useTemplates = (category?: PlantillaCategoria) => {
  const [templates, setTemplates] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getTemplates(category);
      setTemplates(data);
      setLoading(false);
    };
    fetch();
  }, [category]);

  return { templates, loading };
};
