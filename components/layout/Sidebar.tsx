'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, FolderOpen, Grid3X3, Trash2, Settings, ChevronDown, ChevronRight, LayoutVertical, LayoutHorizontal, BarChart3, Table2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/plantillas', icon: Home, label: 'Inicio' },
  { href: '/proyectos', icon: FolderOpen, label: 'Mis proyectos' },
  { href: '/papelera', icon: Trash2, label: 'Papelera' },
  { href: '/configuracion', icon: Settings, label: 'Configuración' },
];

const templateCategories = [
  { href: '/plantillas', icon: Grid3X3, label: 'Todas' },
  { href: '/plantillas/vertical', icon: LayoutVertical, label: 'Verticales' },
  { href: '/plantillas/horizontal', icon: LayoutHorizontal, label: 'Horizontales' },
  { href: '/plantillas/graficas', icon: BarChart3, label: 'Con gráficas' },
  { href: '/plantillas/tablas', icon: Table2, label: 'Con tablas' },
  { href: '/plantillas/otros', icon: MoreHorizontal, label: 'Otros estilos' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [templatesOpen, setTemplatesOpen] = useState(true);

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-background h-[calc(100vh-4rem)] sticky top-16 p-4 gap-1">
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === item.href
              ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#06B6D4]/10 text-[#2563EB]'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}

      <div className="mt-4">
        <button
          onClick={() => setTemplatesOpen(!templatesOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" /> Plantillas
          </span>
          {templatesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <AnimatePresence>
          {templatesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {templateCategories.map(cat => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={cn(
                    'flex items-center gap-3 px-6 py-2 rounded-lg text-sm transition-colors',
                    pathname === cat.href
                      ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#06B6D4]/10 text-[#2563EB] font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 border-t">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          Negex v1.0 · © 2024
        </div>
      </div>
    </aside>
  );
};
