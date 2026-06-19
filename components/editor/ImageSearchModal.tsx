'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { uploadImage } from '@/lib/storage';
import { toast } from 'sonner';

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const ImageSearchModal = ({ onSelect, onClose }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const searchUnsplash = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=demo`);
      const data = await res.json();
      setResults((data.results || []).map((r: any) => r.urls.small));
    } catch {
      toast.error('Error al buscar imágenes');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, `uploads/${Date.now()}_${file.name}`);
      onSelect(url);
      onClose();
    } catch {
      toast.error('Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Buscar o subir imagen</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar imágenes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchUnsplash()}
            />
            <Button onClick={searchUnsplash} variant="secondary"><Search className="h-4 w-4" /></Button>
            <label className="cursor-pointer">
              <Button variant="outline" asChild disabled={uploading}>
                <span><Upload className="h-4 w-4 mr-1" /> {uploading ? 'Subiendo...' : 'Subir'}</span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {results.map((url, i) => (
              <button key={i} onClick={() => { onSelect(url); onClose(); }} className="aspect-square overflow-hidden rounded-lg border hover:border-primary transition-colors">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
