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
  AlertCircle 
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
        ? 'Lecture centr\u00e9e pour consulter le support sans distraction.'
        : 'Aper\u00e7u centr\u00e9 pour garder la lecture simple et claire.',
      badge: asset.category,
      sourceLabel: !isImage ? 'Document' : 'Image',
      pdfUrl: asset.url,
      content: !isImage ? null : `![${asset.title}](${asset.url})`
    });
    setReaderOpen(true);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(236,72,153,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,#050816_0%,#0b1020_50%,#0f1328_100%)]" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-10 p-6 md:p-8">
        <header className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-pink-200 backdrop-blur">
              <Palette size={16} /> Brand & Communication
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">Biblioth\u00e8que d'Assets</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Le hub visuel d'Opays Tech pour contr\u00f4ler les assets, les templates et la coh\u00e9rence de marque.</p>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/15"
          >
            <Plus size={18} /> Ajouter un Asset
          </button>
        </header>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl md:w-auto">
            {['ALL', 'BRAND', 'SALES', 'VISION', 'COMM'].map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-white text-slate-900 shadow-lg shadow-black/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat === 'ALL' ? 'Tous' : cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un fichier..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none backdrop-blur-xl placeholder:text-slate-500 focus:border-pink-500/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 rounded-[2rem] bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <AlertCircle size={48} className="text-red-400 opacity-50" />
            <p className="text-slate-400">Impossible de charger les assets : {error}</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <ImageIcon size={48} className="text-slate-700" />
            <p className="text-slate-500">Aucun asset trouv\u00e9 dans cette cat\u00e9gorie.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                role="button"
                tabIndex={0}
                onClick={() => openAsset(asset)}
                className="group flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 text-left shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:border-pink-500/20"
              >
                <div className="flex aspect-video items-center justify-center bg-white/5 transition-colors group-hover:bg-pink-500/10 overflow-hidden">
                  {asset.url?.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i) ? (
                    <img src={asset.url} alt={asset.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                  ) : (
                    <FileText size={32} className="text-slate-500 transition group-hover:text-pink-300" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <span className="mb-1 text-[9px] font-bold uppercase tracking-[0.3em] text-pink-300">{asset.category}</span>
                  <h3 className="mb-4 text-sm font-semibold text-white line-clamp-2">{asset.title}</h3>
                  <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Document</span>
                    <div className="flex gap-2">
                      <a 
                        href={asset.url} 
                        download 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                      >
                        <Download size={14} />
                      </a>
                      <button 
                        onClick={(e) => handleDelete(asset.id, e)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 transition hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-8">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-pink-500/20 bg-gradient-to-br from-pink-600 via-fuchsia-600 to-violet-700 p-10 text-white shadow-2xl shadow-pink-600/20">
              <div className="absolute right-0 top-0 p-10 opacity-10">
                <Globe size={120} />
              </div>
              <h2 className="mb-4 text-2xl font-semibold">Vision Communication</h2>
              <p className="mb-8 leading-relaxed text-pink-100">
                Zaina, votre r\u00f4le est de traduire les prouesses techniques en histoires impactantes pour les d\u00e9cideurs.
              </p>
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Target</p>
                  <p className="text-lg font-semibold">B2B DRC & Global</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Tone</p>
                  <p className="text-lg font-semibold">Expert & Sovereign</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6 rounded-[2.5rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-300">
                <ImageIcon size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Guidelines Brand</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-400">
                  Consultez la charte pour garantir la coh\u00e9rence visuelle.
                </p>
              </div>
              <button
                className="mx-auto w-fit rounded-2xl bg-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-slate-900 transition hover:bg-slate-100"
              >
                Ouvrir les Guidelines
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <AICreativeAgent />
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
