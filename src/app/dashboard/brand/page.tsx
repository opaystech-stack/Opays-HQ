"use client";

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  Plus, 
  Search, 
  ExternalLink, 
  Globe, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import DocumentReaderModal from '@/components/DocumentReaderModal';
import NewAssetModal from '@/components/modals/NewAssetModal';
import AICreativeAgent from '@/components/AICreativeAgent';

export default function BrandPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [readerOpen, setReaderOpen] = useState(false);
  const [readerAsset, setReaderAsset] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('global_documents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setAssets(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer cet asset ?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('global_documents')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      setAssets(assets.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesCategory = activeCategory === 'ALL' || a.category === activeCategory;
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openAsset = (asset: any) => {
    const isImage = asset.url?.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i);
    setReaderAsset({
      ...asset,
      subtitle: !isImage
        ? 'Lecture centrée pour consulter le support sans distraction.'
        : 'Aperçu centré pour garder la lecture simple et claire.',
      badge: asset.category,
      sourceLabel: !isImage ? 'Document' : 'Image',
      pdfUrl: asset.url,
      content: !isImage ? null : `![${asset.title}](${asset.url})`
    });
    setReaderOpen(true);
  };

  return (
    <div className="relative min-h-full px-6 py-8 text-slate-900 lg:px-8 bg-[#f8f9fb]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      
      <div className="relative z-10 mx-auto max-w-[1600px] space-y-10">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-pink-600">
              <Palette size={14} /> Identité de Marque
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl uppercase">Brand Assets</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 font-medium">
                Contrôlez l'image d'Opays Tech. Accédez aux ressources créatives, aux templates et aux guidelines pour une communication d'élite.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-slate-900/10 transition hover:bg-black"
          >
            <Plus size={18} /> Ajouter un Asset
          </button>
        </header>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[400px_1fr]">
          <aside className="space-y-8">
            <div className="relative overflow-hidden rounded-[3rem] border border-pink-100 bg-gradient-to-br from-pink-600 via-rose-600 to-indigo-700 p-10 text-white shadow-2xl shadow-pink-600/20">
              <div className="absolute right-0 top-0 p-10 opacity-10">
                <Globe size={120} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Vision Créative</h2>
              <p className="mt-6 text-sm leading-relaxed text-pink-50 font-medium opacity-90 text-justify">
                Notre marque doit inspirer la confiance, la souveraineté et la précision technique. Pas de fioritures, seulement de la clarté.
              </p>
              <div className="mt-10 space-y-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Palette Principale</p>
                  <div className="flex gap-3">
                    {['#4F46E5', '#E11D48', '#0F172A'].map(color => (
                      <div key={color} className="group relative">
                        <div className="h-10 w-10 rounded-xl border border-white/20 shadow-lg" style={{ backgroundColor: color }} />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Typographie</p>
                  <p className="text-2xl font-black uppercase tracking-tighter">Inter / Outfit</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400 mb-8">Outils Créatifs</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Color Picker', icon: <Palette size={16} />, action: () => alert('Palette Opays copiée dans le presse-papier.') },
                  { label: 'Type Specimen', icon: <FileText size={16} />, action: () => alert('Chargement des spécimens Outfit/Inter...') },
                  { label: 'Template Generator', icon: <Sparkles size={16} />, action: () => alert('Ouverture du moteur de templates (Flyers, Decks)...') },
                  { label: 'Asset Export', icon: <Download size={16} />, action: () => alert('Préparation du package ZIP des assets (SVG, PNG)...') },
                ].map((tool, i) => (
                  <button 
                    key={i} 
                    onClick={tool.action}
                    className="flex items-center justify-between rounded-2xl border border-slate-50 bg-slate-50 px-6 py-4 text-xs font-bold text-slate-600 transition hover:bg-white hover:border-pink-200 hover:text-pink-600 group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-slate-400 group-hover:text-pink-600 transition-colors">{tool.icon}</span>
                      {tool.label}
                    </span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </div>

            <AICreativeAgent />
          </aside>

          <div className="space-y-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex w-full overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white p-1.5 shadow-sm md:w-auto">
                {['ALL', 'BRAND', 'SALES', 'VISION', 'COMM'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                        : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tous les Assets' : cat}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un asset..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-14 pr-6 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400/50 focus:ring-4 focus:ring-pink-50/50 font-medium shadow-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[4/5] rounded-[2.5rem] bg-white border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-200 mb-6">
                  <ImageIcon size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bibliothèque vide</p>
                <p className="mt-2 text-xs text-slate-400 font-medium italic">Commencez par ajouter vos premiers supports de communication.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => openAsset(asset)}
                    className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition-all hover:border-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/5"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-slate-50 group-hover:bg-pink-50 transition-colors">
                      {asset.url?.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i) ? (
                        <img src={asset.url} alt={asset.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileText size={48} className="text-slate-200 group-hover:text-pink-200 transition-colors" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-8">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-600">{asset.category}</span>
                        <div className="rounded-full bg-slate-50 p-1 text-slate-300">
                          <ExternalLink size={12} />
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-pink-600 transition-colors">{asset.title}</h3>
                      <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Digital</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleDelete(asset.id, e)}
                            className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <NewAssetModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchAssets}
      />

      <DocumentReaderModal
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        title={readerAsset?.title || 'Document'}
        subtitle={readerAsset?.subtitle}
        content={readerAsset?.content}
        pdfUrl={readerAsset?.pdfUrl}
        badge={readerAsset?.badge}
        sourceLabel={readerAsset?.sourceLabel}
      />
    </div>
  );
}
