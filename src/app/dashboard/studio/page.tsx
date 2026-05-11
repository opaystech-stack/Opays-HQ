"use client";

import React, { useState } from 'react';
import { Target, Zap, TrendingDown, DollarSign, ArrowRight, RotateCcw } from 'lucide-react';

export default function StudioPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    companyName: '',
    niche: '',
    salaryMonthly: 2500, // Salaire de base
    employerLoadPercent: 35, // Charges employeur
    hoursLostWeekly: 10,
    productiveHoursMonthly: 140, // Heures réelles (160h - formation/congés/réunions)
    dealValue: 5000,
    dealsLostMonthly: 1,
    errorCostMonthly: 500, // Coût des erreurs/rework
    opaysMonthlyCost: 600, // Coût de maintenance OPAYS
    implementationCost: 5000, // Setup initial
    confidencePercent: 80 // Décote de sécurité (Confiance)
  });

  const calculateROI = () => {
    // 1. Calcul du salaire chargé
    const loadedSalaryMonthly = data.salaryMonthly * (1 + data.employerLoadPercent / 100);
    
    // 2. Taux horaire productif
    const hourlyRate = loadedSalaryMonthly / Math.max(data.productiveHoursMonthly, 1);
    
    // 3. Fuite de main d'œuvre (Annuel)
    const directLaborCostAnnual = hourlyRate * data.hoursLostWeekly * 52;
    const errorCostAnnual = data.errorCostMonthly * 12;
    
    // 4. Manque à gagner (Annuel)
    const opportunityCostAnnual = data.dealValue * data.dealsLostMonthly * 12;
    
    // 5. Fuite Brute Totale
    const bruteLeak = directLaborCostAnnual + opportunityCostAnnual + errorCostAnnual;
    
    // 6. Fuite Décotée (Montant défendable)
    const confidenceAdjustedLeak = bruteLeak * (data.confidencePercent / 100);

    // 7. Analyse de Rentabilité
    const opaysAnnualCost = data.opaysMonthlyCost * 12;
    const netAnnualGain = confidenceAdjustedLeak - opaysAnnualCost;
    const paybackMonths = data.implementationCost / (netAnnualGain / 12);
    const roiMultiple = (netAnnualGain * 3) / data.implementationCost; // ROI sur 3 ans
    
    return {
      loadedSalaryMonthly,
      hourlyRate,
      directLaborCostAnnual,
      opportunityCostAnnual,
      errorCostAnnual,
      totalLeak: bruteLeak,
      confidenceAdjustedLeak,
      opaysAnnualCost,
      netAnnualGain,
      paybackMonths,
      roiMultiple
    };
  };

  const results = calculateROI();

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="p-8 space-y-10 text-white max-w-5xl mx-auto print:p-0 print:text-black">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-zinc-900, .bg-zinc-950, .bg-blue-600 { background: white !important; color: black !important; border: 1px solid #e5e7eb !important; }
          .text-zinc-500, .text-zinc-400 { color: #4b5563 !important; }
          .text-white { color: black !important; }
          .shadow-2xl, .shadow-lg { shadow: none !important; }
        }
      `}</style>

      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-500 text-[10px] font-bold uppercase tracking-widest">
          <Zap size={12} /> OPAYS STUDIO
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Calculateur de ROI & Audit Flash</h1>
        <p className="text-zinc-500 max-w-xl mx-auto">
          Transformez le "temps perdu" en "argent perdu" pour rendre votre offre indiscutable.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-2xl">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">1</span>
                Contexte du Client
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Nom de l'entreprise</label>
                  <input 
                    type="text" 
                    placeholder="ex: Cabinet Immobilier"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                    value={data.companyName}
                    onChange={(e) => setData({...data, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Niche / Secteur</label>
                  <input 
                    type="text" 
                    placeholder="ex: Courtage"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                    value={data.niche}
                    onChange={(e) => setData({...data, niche: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
              >
                Suivant <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">2</span>
                Analyse de la Fuite Directe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Salaire Mensuel Chargé ($)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.salaryMonthly}
                    onChange={(e) => setData({...data, salaryMonthly: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">Coût employeur de la personne qui fait la tâche.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Charges Employeur (%)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.employerLoadPercent}
                    onChange={(e) => setData({...data, employerLoadPercent: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">Rend le chiffrage défendable face à un DAF.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Heures Perdues / Semaine</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.hoursLostWeekly}
                    onChange={(e) => setData({...data, hoursLostWeekly: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">Temps passé sur des tâches automatisables.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Heures Productives / Mois</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.productiveHoursMonthly}
                    onChange={(e) => setData({...data, productiveHoursMonthly: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">Évite le faux standard 160h si réunions/congés réduisent le temps utile.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-zinc-800 text-white font-bold rounded-xl">Retour</button>
                <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2">Suivant <ArrowRight size={18} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm">3</span>
                Coût d'Opportunité
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Valeur d'un Contrat ($)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.dealValue}
                    onChange={(e) => setData({...data, dealValue: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Contrats Perdus / Mois</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.dealsLostMonthly}
                    onChange={(e) => setData({...data, dealsLostMonthly: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">À cause des délais ou oublis administratifs.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Erreurs / Rework ($/mois)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.errorCostMonthly}
                    onChange={(e) => setData({...data, errorCostMonthly: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">Pénalités, reprises, retards, corrections manuelles.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Confiance (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.confidencePercent}
                    onChange={(e) => setData({...data, confidencePercent: Number(e.target.value)})}
                  />
                  <p className="text-[10px] text-zinc-600 italic">Décote obligatoire tant que la donnée n'est pas auditée.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Maintenance OPAYS ($/mois)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.opaysMonthlyCost}
                    onChange={(e) => setData({...data, opaysMonthlyCost: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Setup Initial ($)</label>
                  <input 
                    type="number" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-blue-500 outline-none"
                    value={data.implementationCost}
                    onChange={(e) => setData({...data, implementationCost: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-zinc-800 text-white font-bold rounded-xl">Retour</button>
                <button onClick={() => setStep(4)} className="flex-[2] py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">Générer le Diagnostic</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500 text-center py-6">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                <Target size={40} />
              </div>
              <h2 className="text-3xl font-bold">Diagnostic Prêt</h2>
              <p className="text-zinc-400">Le chiffrage de la fuite pour <strong>{data.companyName || 'le client'}</strong> est terminé.</p>
              
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fuite de Main d'œuvre (Annuel) :</span>
                  <span className="font-bold text-zinc-300">{results.directLaborCostAnnual.toLocaleString()} $</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Manque à gagner (Annuel) :</span>
                  <span className="font-bold text-red-400">{results.opportunityCostAnnual.toLocaleString()} $</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500">Erreurs & Rework (Annuel) :</span>
                  <span className="font-bold text-orange-400">{results.errorCostAnnual.toLocaleString()} $</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-lg font-bold">FUITE TOTALE IDENTIFIÉE :</span>
                  <span className="text-2xl font-black text-white">{results.totalLeak.toLocaleString()} $ / an</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Fuite décotée</p>
                    <p className="text-lg font-black">{results.confidenceAdjustedLeak.toLocaleString()} $</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Gain net annuel</p>
                    <p className={`text-lg font-black ${results.netAnnualGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>{results.netAnnualGain.toLocaleString()} $</p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold">Payback</p>
                    <p className="text-lg font-black">{Number.isFinite(results.paybackMonths) ? `${results.paybackMonths.toFixed(1)} mois` : 'Non rentable'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 no-print">
                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-zinc-800 text-white rounded-xl flex items-center justify-center gap-2"><RotateCcw size={16} /> Recommencer</button>
                <button onClick={handleExportPDF} className="flex-[2] py-3 bg-white text-black font-bold rounded-xl">Télécharger la Proposition PDF</button>
              </div>
            </div>
          )}
        </div>

        {/* Résumé Latéral */}
        <div className="space-y-6 no-print">
          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl shadow-blue-500/20">
            <TrendingDown size={32} className="mb-4" />
            <h3 className="text-lg font-bold mb-2">Impact de la Fuite</h3>
            <p className="text-5xl font-black mb-4">
              {results.totalLeak > 1000000 
                ? (results.totalLeak / 1000000).toFixed(1) + 'M' 
                : results.totalLeak.toLocaleString()} $
            </p>
            <p className="text-sm opacity-80 leading-relaxed">
              C'est le montant que l'entreprise "brûle" chaque année à cause de ses inefficacités actuelles.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Véhicule Suggéré</h4>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-xl">
                {results.totalLeak > 50000 ? '🏗️' : '🤖'}
              </div>
              <div>
                <p className="text-sm font-bold">
                  {results.totalLeak > 50000 ? 'Infrastructure IA Complete' : 'Agent IA de Spécialité'}
                </p>
              <p className="text-[10px] text-zinc-500">
                ROI x{results.roiMultiple.toFixed(1)} après décote de confiance.
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
