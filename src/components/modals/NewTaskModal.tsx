"use client";

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function NewTaskModal({ isOpen, onClose, onSuccess, task }: { isOpen: boolean, onClose: () => void, onSuccess: () => void, task?: any }) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const supabase = createClient();
  const [formData, setFormData] = useState({ title: '', project_id: '', priority: 'MEDIUM', due_date: '', assigned_to: '' });

  useEffect(() => {
    if (isOpen) {
      supabase.from('projects').select('id, title').then(({ data }) => { if (data) setProjects(data); });
      supabase.from('profiles').select('id, full_name').then(({ data }) => { if (data) setMembers(data); });
      
      if (task) {
        setFormData({
          title: task.title || '',
          project_id: task.project_id || '',
          priority: task.priority || 'MEDIUM',
          due_date: task.due_date || '',
          assigned_to: task.assigned_to || ''
        });
      } else {
        setFormData({ title: '', project_id: '', priority: 'MEDIUM', due_date: '', assigned_to: '' });
      }
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let res;
    if (task) {
      res = await supabase.from('tasks').update(formData).eq('id', task.id);
    } else {
      res = await supabase.from('tasks').insert([{ ...formData, status: 'TODO' }]);
    }

    setLoading(false);
    if (!res.error) { onSuccess(); onClose(); }
    else { alert(`Erreur lors de la ${task ? 'modification' : 'création'} de la tâche`); }
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-slate-900 outline-none transition focus:border-cyan-400/50 focus:bg-white focus:ring-4 focus:ring-cyan-50/50 text-sm font-medium";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CheckCircle2 size={18} className="text-cyan-600" /> {task ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-900">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Titre *</label>
            <input required type="text" className={inputClass} placeholder="Que faut-il faire ?" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Projet</label>
              <select className={inputClass} value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})}>
                <option value="">Sans projet</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Priorité</label>
              <select className={inputClass} value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Assigné à</label>
            <select className={inputClass} value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}>
              <option value="">Sélectionner un membre...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Échéance</label>
            <input type="date" className={inputClass} value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="flex-[2] rounded-2xl bg-cyan-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-700 disabled:opacity-50">
              {loading ? (task ? 'Modification...' : 'Création...') : (task ? 'Enregistrer' : 'Créer la Tâche')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
