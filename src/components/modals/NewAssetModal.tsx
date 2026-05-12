"use client";

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAssetModal({ isOpen, onClose, onSuccess }: NewAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'FILE' | 'URL'>('FILE');
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'BRAND',
  });

  const supabase = createClient();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifi\u00e9');

      let finalUrl = formData.url;

      if (uploadType === 'FILE' && file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `assets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('brand-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('brand-assets')
          .getPublicUrl(filePath);
        
        finalUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from('global_documents').insert([{
        title: formData.title,
        url: finalUrl,
        category: formData.category,
        uploaded_by: user.id,
        visible_to_types: ['ASSOCIATE']
      }]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#090d1d] shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="relative p-8">
          <button 
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Ajouter un Asset</h2>
            <p className="text-sm text-slate-400">Ajoutez une ressource officielle \u00e0 la biblioth\u00e8que de marque.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400/80">Titre de l'asset</label>
              <input 
                required
                type="text" 
                placeholder="Ex: Logo Opays (Variante Sombre)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white outline-none focus:border-pink-500/50 transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400/80">Cat\u00e9gorie</label>
                <select 
                  className="w-full rounded-2xl border border-white/10 bg-[#0c1226] p-4 text-sm text-white outline-none focus:border-pink-500/50"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="BRAND">Brand / Identity</option>
                  <option value="SALES">Sales Support</option>
                  <option value="VISION">Vision / R&D</option>
                  <option value="COMM">Communication</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400/80">Source</label>
                <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
                  <button 
                    type="button"
                    onClick={() => setUploadType('FILE')}
                    className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${uploadType === 'FILE' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    Fichier
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUploadType('URL')}
                    className={`flex-1 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${uploadType === 'URL' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >
                    Lien
                  </button>
                </div>
              </div>
            </div>

            {uploadType === 'FILE' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400/80">Fichier (Image, PDF, SVG)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 group-hover:border-pink-500/30 group-hover:bg-pink-500/5 transition-all">
                    <div className="p-3 rounded-xl bg-white/5 text-slate-400 group-hover:text-pink-400 transition-colors">
                      <Upload size={24} />
                    </div>
                    <p className="text-xs text-slate-400">
                      {file ? file.name : "Cliquez ou glissez un fichier ici"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-pink-400/80">URL du document</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="url" 
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 pl-12 text-sm text-white outline-none focus:border-pink-500/50"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-fuchsia-600 p-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-pink-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Traitement...
                </>
              ) : (
                <>
                  Ajouter l'Asset <CheckCircle size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
