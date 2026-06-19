'use client';
import { useParams } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { CategoryTabs } from '@/components/templates/CategoryTabs';
import { PlantillaCategoria } from '@/types';

export default function CategoryPlantillasPage() {
  const params = useParams();
  const category = params.category as PlantillaCategoria;
  const { templates, loading } = useTemplates(category);

  return (
    <div className="space-y-6">
      <CategoryTabs />
      <TemplateGrid templates={templates} loading={loading} />
    </div>
  );
}
