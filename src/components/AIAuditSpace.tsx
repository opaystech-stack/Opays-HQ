"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Zap, Search, BarChart3, Activity, ShieldAlert, CheckCircle2, Loader2, Sparkles, Database, Info, ArrowRight, Plus, TrendingUp } from 'lucide-react';

const AuditNode = ({ title, status, description }: { title: string, status: string, description: string }) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:border-indigo-500/30 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
      <Activity size={100} />
    </div>
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-3 h-3 rounded-full ${status === 'analyzing' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'}`} />
      <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 group-hover:text-indigo-600 transition-colors">{title}</h4>
    </div>
    <p className="text-sm text-slate-500 font-medium leading-relaxed relative z-10">{description}</p>
  </div>
);

export default function AIAuditSpace() {
  const [audits, setAudits] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const supabase = createClient();

  const fetchAudits = async () => {
    const { data } = await supabase
      .from('leads')
      .select('company_name, status, audit_deadline')
      .not('audit_deadline', 'is', null)
      .limit(5);
    if (data) setAudits(data);
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const runFlashAudit = () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        score: 84,
        frictions: [
          "Délai de validation contractuelle excessif (+4 jours vs benchmark)",
          "Absence de tagging automatisé sur les leads entrants",
          "Rupture de flux entre le premier contact et l'audit technique"
        ],
        roi: "14,200 $ / an via automatisation"
      });
    }, 3500);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json,.xlsx';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Fichier "${file.name}" reçu. L'IA commence le pré-traitement du dataset.`);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Moteur de Diagnostic IA</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl uppercase">Audit <span className="text-indigo-600">Stratégique</span></h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-500 font-medium">Identifiez les inefficacités structurelles et projetez le ROI de l'automatisation en temps réel.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={handleImport}
            className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
          >
            <Plus size={16} /> Import Dataset
          </button>
          <button 
            onClick={runFlashAudit}
            disabled={isAnalyzing}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center gap-3 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} className="text-indigo-400" />}
            {isAnalyzing ? 'Calcul IA...' : 'Lancer Flash Audit'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 mb-10 uppercase tracking-[0.2em] flex items-center gap-2">
              <Search size={14} /> Flux Connectés
            </h3>
            <div className="space-y-4">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Supabase Core</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              </div>
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-indigo-200 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <Activity size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Obsidian RAG</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              </div>
              
              <button 
                onClick={handleImport}
                className="w-full border-2 border-dashed border-slate-100 rounded-3xl p-8 text-center hover:border-indigo-500/30 hover:bg-indigo-50/30 cursor-pointer transition-all mt-6 group"
              >
                <Plus size={24} className="mx-auto text-slate-200 group-hover:text-indigo-500 transition-colors mb-4" />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Connecter une source</p>
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50">
              <div className="flex items-center gap-3 text-indigo-600 mb-4">
                <Info size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Opays tactical v2.4</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                Optimisé pour l'identification des frictions B2B et la génération automatique de business cases.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-10">
          {analysisResult ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
               <div className="bg-white border border-indigo-200 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-600/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 text-indigo-100">
                  <Activity size={80} />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-lg shadow-indigo-600/20">
                    <ShieldAlert size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Diagnostic de Friction</h4>
                </div>
                <ul className="space-y-4 relative z-10">
                  {analysisResult.frictions.map((f: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium">
                      <span className="text-indigo-600 font-black">•</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="rounded-xl bg-indigo-500 p-2 text-white">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-indigo-200">Potentiel de Gain (ROI)</h4>
                </div>
                <div className="mt-8">
                  <p className="text-4xl font-bold tracking-tighter">{analysisResult.roi}</p>
                  <p className="mt-4 text-xs text-slate-400 font-medium uppercase tracking-widest leading-relaxed">
                    Basé sur une réduction de 30% du cycle de vente via l'automatisation du tri et de la qualification.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AuditNode 
                title="Détection Automatique" 
                status={isAnalyzing ? 'analyzing' : 'completed'} 
                description="L'IA scanne en permanence le pipeline pour identifier les anomalies de conversion." 
              />
              <AuditNode 
                title="Business Case" 
                status="completed" 
                description="Génération automatique d'arguments de vente basés sur les gains d'efficacité identifiés." 
              />
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_60%)] pointer-events-none" />
             
             {isAnalyzing ? (
               <div className="text-center space-y-10 relative z-10">
                  <div className="w-32 h-32 rounded-[3.5rem] bg-slate-900 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-600/40 animate-pulse">
                    <Loader2 size={48} className="text-indigo-400 animate-spin" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Analyse Tactique...</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                      L'IA parcourt les logs d'activité et les délais de pipeline pour extraire des signaux de friction.
                    </p>
                  </div>
               </div>
             ) : analysisResult ? (
               <div className="w-full text-center space-y-10 py-10">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 mx-auto flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Audit Terminé</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed">
                      Le rapport est prêt. Vous pouvez l'exporter pour le présenter au prospect ou l'utiliser pour ajuster votre stratégie commerciale.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setAnalysisResult(null)} className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Réinitialiser</button>
                    <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/10">Exporter en PDF</button>
                  </div>
               </div>
             ) : (
               <div className="w-full max-w-3xl space-y-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dernières opportunités détectées</h3>
                    <Sparkles size={18} className="text-indigo-600" />
                  </div>
                  {audits.length > 0 ? (
                    <div className="space-y-4">
                      {audits.map((audit, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] group hover:border-indigo-200 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              <BarChart3 size={20} />
                            </div>
                            <div>
                              <p className="text-base font-bold text-slate-900 uppercase tracking-tight">{audit.company_name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Status : {audit.status}</p>
                            </div>
                          </div>
                          <button onClick={runFlashAudit} className="px-4 py-2 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-600 rounded-lg border border-slate-100 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all opacity-0 group-hover:opacity-100">Lancer Audit</button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <p className="text-sm font-medium text-slate-400 italic">Aucune opportunité récente détectée dans le pipeline.</p>
                      <button onClick={runFlashAudit} className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Simuler une activité <ArrowRight size={14} className="inline ml-2" /></button>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
