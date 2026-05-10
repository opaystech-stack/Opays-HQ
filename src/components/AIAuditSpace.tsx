"use client";

import React from 'react';

// Composant pour l'espace d'audit avec IA
const AuditNode = ({ title, status, description }: { title: string, status: string, description: string }) => (
  <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl shadow-xl">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-2 h-2 rounded-full ${status === 'analyzing' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
      <h4 className="font-bold text-zinc-200">{title}</h4>
    </div>
    <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
  </div>
);

export default function AIAuditSpace() {
  return (
    <div className="p-8 space-y-10 bg-black min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-blue-500 uppercase">Intelligence Opérationnelle</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Espace Audit Live</h1>
        </div>
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
          Nouvel Audit Flash
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Panneau de Contrôle IA */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest">Sources de données</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center hover:border-zinc-700 cursor-pointer transition-all">
                <span className="text-2xl mb-2 block">📄</span>
                <p className="text-xs text-zinc-500">Déposez vos fichiers (CSV, XLSX, PDF)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualisation de l'Analyse */}
        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AuditNode 
              title="Analyse des Frictions" 
              status="analyzing" 
              description="L'IA identifie actuellement les goulots d'étranglement dans le flux de facturation du client..." 
            />
            <AuditNode 
              title="Projection ROI" 
              status="completed" 
              description="Potentiel d'économie identifié : 12 400 $ / an par l'automatisation du tri des leads." 
            />
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 min-h-[400px] flex items-center justify-center relative overflow-hidden">
             {/* Animation de fond pour le côté IA */}
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
             <div className="text-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl shadow-2xl shadow-blue-500/50">
                  🤖
                </div>
                <p className="text-zinc-400 max-w-md mx-auto">
                  En attente de données... Connectez une source pour lancer l'analyse prédictive d'efficience.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
