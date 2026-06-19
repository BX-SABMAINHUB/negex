'use client';
import { Plantilla } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Crown } from 'lucide-react';

interface Props {
  template: Plantilla;
  onUse: (template: Plantilla) => void;
}

export const TemplateCard = ({ template, onUse }: Props) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="group overflow-hidden border-2 hover:border-[#2563EB]/50 transition-all duration-300">
      <div className="aspect-[4/5] relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <img
          src={template.thumbnailUrl || '/templates/placeholder.svg'}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm">{template.description}</p>
        </div>
        {template.isPremium && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-500 text-white gap-1">
              <Crown className="h-3 w-3" /> Premium
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm truncate">{template.name}</h3>
        <Badge variant="secondary" className="capitalize">{template.category}</Badge>
        <Button
          variant="gradient"
          size="sm"
          className="w-full"
          onClick={() => onUse(template)}
        >
          Usar plantilla <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </Card>
  </motion.div>
);
