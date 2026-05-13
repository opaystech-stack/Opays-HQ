"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { X, Shield, Check, Lock, AlertCircle, Search, Users, Briefcase, Wallet, Target, FlaskConical, Monitor, Radio, Palette, BookOpen, Lightbulb, Calendar, FileText, BarChart3, Settings, Sparkles } from 'lucide-react';

const MODULES = [
  // Modules généraux
  { id: 'projects', label: 'Projets', description: 'Accès aux hubs projets et workspaces', icon: Briefcase, category: 'Général' },
  { id: 'tasks', label: 'Tâches', description: 'Gestion des tâches personnelles et d\'équipe', icon: Check, category: 'Général' },
  { id: 'knowledge', label: 'Guide & Savoir-faire', description: 'Base de connaissances interne', icon: BookOpen, category: 'Général' },
  { id: 'ideas', label: 'Boîte à Idées', description: 'Propositions et innovations', icon: Lightbulb, category: 'Général' },
  { id: 'calendar', label: 'Calendrier', description: 'Planning et événements', icon: Calendar, category: 'Général' },
  // Modules Associés / Ventes
  { id: 'leads', label: 'Prospects (Ventes)', description: 'Pipeline commercial et CRM', icon: Users, category: 'Ventes & Business' },
  { id: 'studio', label: 'Outils de Vente', description: 'Stratégie ROI et outils commerciaux', icon: Target, category: 'Ventes & Business' },
  { id: 'coordination', label: 'Coordination', description: 'Communication interne et pilotage', icon: Radio, category: 'Ventes & Business' },
  { id: 'brand', label: 'Brand Assets', description: 'Identité visuelle et communication', icon: Palette, category: 'Ventes & Business' },
  { id: 'contracts', label: 'Contrats', description: 'Gestion des contrats et engagements', icon: FileText, category: 'Ventes & Business' },
  // Modules stratégiques
  { id: 'treasury', label: 'Trésorerie', description: 'Flux financiers et comptabilité', icon: Wallet, category: 'Finance & Stratégie' },
  { id: 'equity', label: 'Equity / Capital', description: 'Répartition des parts et vesting', icon: BarChart3, category: 'Finance & Stratégie' },
  { id: 'audit', label: 'Audit IA', description: 'Audits ROI et analyse IA', icon: Sparkles, category: 'Finance & Stratégie' },
  // Modules techniques
  { id: 'labs', label: 'Labs (R&D)', description: 'Recherche et développement', icon: FlaskConical, category: 'Technique' },
  { id: 'workspace', label: 'Workspace', description: 'Ingénierie et production', icon: Monitor, category: 'Technique' },
  { id: 'hr', label: 'Ressources Humaines', description: 'Dossiers du personnel et paie', icon: Users, category: 'Administration' },
  // Modules admin
  { id: 'settings', label: 'Paramètres', description: 'Configuration de la plateforme', icon: Settings, category: 'Administration' },
  { id: 'admin', label: 'Administration', description: 'Gestion des accès et membres', icon: Shield, category: 'Administration' },
];

const CATEGORIES = ['Général', 'Ventes & Business', 'Finance & Stratégie', 'Technique', 'Administration'];

export default function AccessControlModal({ isOpen, onClose, member }: { isOpen: boolean, onClose: () => void, member?: any | null }) {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (member) {
      // Initialiser avec les permissions existantes, ou déduire depuis le rôle
      const existing = member.permissions && typeof member.permissions === 'object' ? member.permissions : {};
      const defaults: Record<string, boolean> = {};

      MODULES.forEach(mod => {
        if (existing[mod.id] !== undefined) {
          defaults[mod.id] = existing[mod.id];
        } else {
          // Déduire les permissions par défaut selon le rôle
          defaults[mod.id] = getDefaultPermission(mod.id, member.role, member.type);
        }
      });

      setPermissions(defaults);
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
      onClose();
    } else {
      alert("Erreur lors de la mise à jour des accès");
    }
    setLoading(false);
  };

  if (!isOpen || !member) return null;

  const filteredModules = search
    ? MODULES.filter(m =>
        m.label.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
      )
    : MODULES;

  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600 border border-indigo-100">
              {member.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Contrôle des Accès</h2>
              <p className="text-xs text-slate-400 font-medium">
                {member.full_name} • {member.role} • {enabledCount}/{MODULES.length} modules actifs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un module..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400/50 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 font-medium"
            />
          </div>
        </div>

        {/* Info banner */}
        <div className="px-6 pt-4">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex gap-3">
            <AlertCircle className="text-indigo-600 shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-indigo-900/60 leading-relaxed font-medium">
              Outrepassez les droits par défaut liés au rôle. Décocher un module le masquera de la navigation du membre.
            </p>
          </div>
        </div>

        {/* Modules list */}
        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-6">
          {CATEGORIES.map(category => {
            const categoryModules = filteredModules.filter(m => m.category === category);
            if (categoryModules.length === 0) return null;

            return (
              <div key={category}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 px-1">{category}</p>
                <div className="space-y-2">
                  {categoryModules.map((mod) => {
                    const Icon = mod.icon;
                    const isEnabled = permissions[mod.id];

                    return (
                      <button
                        key={mod.id}
                        onClick={() => togglePermission(mod.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                          isEnabled
                            ? 'bg-white border-slate-200 hover:border-indigo-300'
                            : 'bg-slate-50/50 border-slate-100 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-all ${
                            isEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{mod.label}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{mod.description}</p>
                          </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-all ${
                          isEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                            isEnabled ? 'left-5' : 'left-1'
                          }`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-[2] py-3 bg-indigo-600 text-white text-sm font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Mise à jour...' : 'Appliquer les accès'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Déduire les permissions par défaut selon le rôle et le type */
function getDefaultPermission(moduleId: string, role: string, type: string): boolean {
  const ROLE_DEFAULTS: Record<string, string[]> = {
    projects: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
    tasks: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
    knowledge: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
    ideas: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
    calendar: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
    leads: ['CEO', 'COO', 'SALES', 'ADMIN'],
    studio: ['CEO', 'SALES', 'ADMIN'],
    coordination: ['CEO', 'SALES', 'ADMIN'],
    brand: ['CEO', 'SALES', 'ADMIN'],
    contracts: ['CEO', 'COO', 'ADMIN'],
    treasury: ['CEO', 'COO', 'ADMIN'],
    equity: ['CEO', 'COO', 'CTO', 'SALES', 'ADMIN'],
    audit: ['CEO', 'COO', 'CTO', 'SALES', 'ENGINEER', 'ADMIN'],
    labs: ['CEO', 'CTO', 'ADMIN'],
    workspace: ['CEO', 'CTO', 'ADMIN'],
    hr: ['CEO', 'COO', 'ADMIN'],
    settings: ['CEO', 'COO', 'CTO', 'ADMIN'],
    admin: ['CEO', 'ADMIN'],
  };

  // HR accessible aux employés
  if (moduleId === 'hr' && type === 'EMPLOYEE') return true;

  const allowedRoles = ROLE_DEFAULTS[moduleId];
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}
