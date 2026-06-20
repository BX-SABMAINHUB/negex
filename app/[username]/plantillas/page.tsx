'use client';
import { useTemplates } from '@/hooks/useTemplates';
import { TemplateGrid } from '@/components/templates/TemplateGrid';
import { CategoryTabs } from '@/components/templates/CategoryTabs';

export default function PlantillasPage() {
  const { templates, loading, error, refetch } = useTemplates();

  return (
    <div className="space-y-6">
      <CategoryTabs />
      <TemplateGrid templates={templates} loading={loading} error={error} onRetry={refetch} />
    </div>
  );
}
