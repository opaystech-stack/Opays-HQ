"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Search, Briefcase, Users, FileText, X, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ projects: any[], leads: any[], tasks: any[] }>({ projects: [], leads: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!query) {
      setResults({ projects: [], leads: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const [
        { data: projects },
        { data: leads },
        { data: tasks }
      ] = await Promise.all([
        supabase.from('projects').select('id, title').ilike('title', `%${query}%`).limit(3),
        supabase.from('leads').select('id, company_name').ilike('company_name', `%${query}%`).limit(3),
        supabase.from('tasks').select('id, title, project_id').ilike('title', `%${query}%`).limit(3)
      ]);

      setResults({
        projects: projects || [],
        leads: leads || [],
        tasks: tasks || []
      });
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
              O
            </div>
            <Search className="text-gray-400" size={18} />
          </div>
          <input 
            autoFocus
            type="text"
            placeholder="Rechercher un projet, un prospect ou une tâche..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-lg font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Command size={10} /> Esc
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query && (
            <div className="py-12 text-center">
              <Search className="mx-auto text-gray-100 mb-4" size={48} />
              <p className="text-gray-400 text-sm italic">Entrez un nom pour commencer la recherche...</p>
            </div>
          )}

          {query && (
            <div className="space-y-4 p-2">
              {results.projects.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Projets</h4>
                  {results.projects.map(p => (
                    <button onClick={() => navigate(`/dashboard/projects/${p.id}`)} key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-all text-left group">
                      <Briefcase size={16} className="text-gray-400 group-hover:text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.leads.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Prospects</h4>
                  {results.leads.map(l => (
                    <button onClick={() => navigate(`/dashboard/leads`)} key={l.id} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-all text-left group">
                      <Users size={16} className="text-gray-400 group-hover:text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">{l.company_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Tâches</h4>
                  {results.tasks.map(t => (
                    <button onClick={() => navigate(`/dashboard/tasks`)} key={t.id} className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl transition-all text-left group">
                      <FileText size={16} className="text-gray-400 group-hover:text-blue-600" />
                      <span className="text-sm font-semibold text-gray-900">{t.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {query && !loading && results.projects.length === 0 && results.leads.length === 0 && results.tasks.length === 0 && (
                <p className="text-center py-8 text-gray-400 text-sm italic">Aucun résultat pour "{query}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
