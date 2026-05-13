"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Shield, Check, Lock, AlertCircle } from 'lucide-react';

const MODULES = [
  { id: 'leads', label: 'Prospects (Ventes)', description: 'Voir et gérer le pipeline commercial' },
  { id: 'projects', label: 'Projets (Production)', description: 'Accès aux hubs projets et workspaces' },
  { id: 'treasury', label: 'Trésorerie', description: 'Visualiser les comptes et flux financiers' },
  { id: 'hr', label: 'Ressources Humaines', description: 'Accès aux dossiers du personnel' },
  { id: 'equity', label: 'Actions / Capital', description: 'Voir la répartition des parts' },
  { id: 'billing', label: 'Facturation', description: 'Gérer les paiements et contrats' },
  { id: 'audit', label: 'Audit IA', description: 'Lancer et consulter les audits IA' },
];

export default function AccessControlModal({ isOpen, onClose, member }: { isOpen: boolean, onClose: () => void, member?: any | null }) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  useEffect(() => {
    if (member) {
      setPermissions(member.permissions || {
        leads: true,
        projects: true,
        tasks: true,
        knowledge: true,
        ideas: true,
        hr: member.type === 'EMPLOYEE',
        treasury: ['CEO', 'COO', 'ADMIN'].includes(member.role),
        equity: member.type === 'ASSOCIATE',
        billing: ['CEO', 'COO', 'ADMIN'].includes(member.role),
        audit: true
      });
    }
  }, [member]);

  const togglePermission = (moduleId: string) => {
    setPermissions(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ permissions })
      .eq('id', member.id);
    
    if (!error) {
      alert(`Accès mis à jour pour ${member.full_name}`);
      onClose();
    } else {
      alert("Erreur lors de la mise à jour");
    }
    setLoading(false);
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Contrôle des Accès</h2>
              <p className="text-xs text-gray-400 font-medium">{member.full_name} • {member.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
            <AlertCircle className="text-blue-600 shrink-0" size={18} />
            <p className="text-xs text-blue-800 leading-relaxed">
              En tant que CEO, vous pouvez outrepasser les droits par défaut liés au rôle. Décocher un module le masquera immédiatement de la barre de navigation du membre.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {MODULES.map((mod) => (
              <button 
                key={mod.id}
                onClick={() => togglePermission(mod.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                  permissions[mod.id] 
                    ? 'bg-white border-gray-200 hover:border-blue-300' 
                    : 'bg-gray-50 border-gray-100 grayscale opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${permissions[mod.id] ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                    {permissions[mod.id] ? <Check size={18} /> : <Lock size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{mod.label}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{mod.description}</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-all ${permissions[mod.id] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions[mod.id] ? 'left-5' : 'left-1'}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition-all"
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Mise à jour...' : 'Appliquer les accès'}
          </button>
        </div>
      </div>
    </div>
  );
}
