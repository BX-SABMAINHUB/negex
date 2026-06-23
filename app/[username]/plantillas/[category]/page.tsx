'use client';
import { useParams } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { CategoryTabs } from '@/components/templates/CategoryTabs';
import { CodeRedeemer } from '@/components/templates/CodeRedeemer';
import { PlantillaCategoria } from '@/types';

export default function CategoryPlantillasPage() {
  const params = useParams();
  const category = params.category as PlantillaCategoria;
  const { templates, loading, error, refetch } = useTemplates(category);

  return (
    <div className="space-y-6">
      <CategoryTabs />
      <CodeRedeemer />
      <TemplateGrid
        templates={templates}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}
