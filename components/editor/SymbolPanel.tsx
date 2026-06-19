'use client';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const symbols = ['π', '%', '€', '$', '∞', '√', '∑', '∫', '∂', '∆', '≈', '≠', '≤', '≥', '±', '×', '÷', 'α', 'β', 'γ', 'Ω', 'θ', '→', '←', '★', '♥', '♦', '♣', '♠', '•'];

interface Props {
  onSelect: (s: string) => void;
  onClose: () => void;
}

export const SymbolPanel = ({ onSelect, onClose }: Props) => (
  <motion.div
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    className="fixed right-0 top-14 bottom-0 w-64 bg-background border-l shadow-xl z-40 p-4 overflow-y-auto"
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">Símbolos</h3>
      <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
    </div>
    <div className="grid grid-cols-5 gap-2">
      {symbols.map(s => (
        <Button
          key={s}
          variant="outline"
          className="h-12 w-12 text-lg font-mono p-0"
          onClick={() => onSelect(s)}
        >
          {s}
        </Button>
      ))}
    </div>
  </motion.div>
);
