'use client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, usePathname } from 'next/navigation';
import { PlantillaCategoria } from '@/types';

const categories: { value: PlantillaCategoria | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'vertical', label: 'Verticales' },
  { value: 'horizontal', label: 'Horizontales' },
  { value: 'graficas', label: 'Gráficas' },
  { value: 'tablas', label: 'Tablas' },
  { value: 'otros', label: 'Otros' },
];

export const CategoryTabs = () => {
  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = pathname.split('/').pop() || 'todas';
  const activeValue = categories.find(c => c.value === currentCategory) ? currentCategory : 'todas';

  return (
    <Tabs value={activeValue} onValueChange={(v) => {
      router.push(v === 'todas' ? '/plantillas' : `/plantillas/${v}`);
    }}>
      <TabsList className="w-full justify-start overflow-x-auto">
        {categories.map(cat => (
          <TabsTrigger key={cat.value} value={cat.value} className="text-sm">
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
