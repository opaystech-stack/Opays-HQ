"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Target, 
  Zap, 
  TrendingDown, 
  DollarSign, 
  ArrowRight, 
  Calculator, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Presentation,
  Briefcase,
  Share2,
  Download,
  Info
} from 'lucide-react';

const ToolCard = ({ title, description, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-[2rem] border text-left transition-all group backdrop-blur-xl ${active ? 'border-cyan-500/30 bg-cyan-500/10 text-white shadow-2xl shadow-cyan-500/10' : 'border-white/10 bg-white/5 text-slate-100 hover:border-cyan-500/20 hover:bg-white/8'}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all ${active ? 'bg-white/15 text-white' : 'bg-white/5 text-cyan-300 group-hover:bg-cyan-500/10'}`}>
      {icon}
    </div>
    <h3 className="font-bold mb-2">{title}</h3>
    <p className={`text-xs leading-relaxed ${active ? 'text-cyan-100' : 'text-slate-400'}`}>{description}</p>
  </button>
);

export default function StudioPage() {
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTool, setActiveTool] = useState('roi');
  const [step, setStep] = useState(1);
  const supabase = createClient();

  const [data, setData] = useState({
    companyName: '',
    niche: '',
    salaryMonthly: 2500,
    employerLoadPercent: 35,
    hoursLostWeekly: 10,
    productiveHoursMonthly: 140,
    dealValue: 5000,
    dealsLostMonthly: 1,
    errorCostMonthly: 500,
    opaysMonthlyCost: 600,
    implementationCost: 5000,
    confidencePercent: 80
  });

  const fetchSimulations = async () => {
    const { data: sims } = await supabase.from('roi_simulations').select('*').order('created_at', { ascending: false });
    if (sims) setSimulations(sims);
  };

  useEffect(() => {
    fetchSimulations();
  }, []);

  const calculateROI = () => {
    const loadedSalaryMonthly = data.salaryMonthly * (1 + data.employerLoadPercent / 100);
    const hourlyRate = loadedSalaryMonthly / Math.max(data.productiveHoursMonthly, 1);
    const directLaborCostAnnual = hourlyRate * data.hoursLostWeekly * 52;
    const errorCostAnnual = data.errorCostMonthly * 12;
    const opportunityCostAnnual = data.dealValue * data.dealsLostMonthly * 12;
    const bruteLeak = directLaborCostAnnual + opportunityCostAnnual + errorCostAnnual;
    const confidenceAdjustedLeak = bruteLeak * (data.confidencePercent / 100);
    const opaysAnnualCost = data.opaysMonthlyCost * 12;
    const netAnnualGain = confidenceAdjustedLeak - opaysAnnualCost;
    
    return {
      totalLeak: bruteLeak,
      netAnnualGain,
      directLaborCostAnnual,
      opportunityCostAnnual
    };
  };

  const results = calculateROI();

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('roi_simulations').insert([{
      company_name: data.companyName,
      sector: data.niche,
      salary_monthly: data.salaryMonthly,
      hours_lost_weekly: data.hoursLostWeekly,
      deal_value: data.dealValue,
      deals_lost_monthly: data.dealsLostMonthly,
      total_leak_annual: results.totalLeak,
      net_gain_annual: results.netAnnualGain,
      created_by: user?.id
    }]);

    if (!error) {
      alert("Simulation enregistrée !");
      fetchSimulations();
      setStep(1);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_26%),linear-gradient(180deg,#050816_0%,#090d1d_58%,#0b1020_100%)]" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-10 p-6 md:p-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-cyan-500/15 via-blue-600/15 to-violet-600/15 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="absolute right-0 top-0 p-12 opacity-10">
          <Presentation size={140} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-white mb-4">
            <Target size={12} /> Hub Marketing & Ventes
          </div>
          <h1 className="text-4xl font-semibold mb-4 tracking-tight">Outils de Croissance Studio</h1>
          <p className="text-slate-200/80 leading-relaxed text-sm">
            Bienvenue dans votre <strong>espace de vente</strong>. Utilisez ces outils pour convaincre vos clients, générer des analyses de rentabilité (ROI) et accéder aux ressources de présentation officielles d'OPAYS TECH.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ToolCard 
          title="Calculateur ROI" 
          description="Démontrez l'intérêt financier de l'automatisation pour vos prospects."
          icon={<Calculator size={24} />}
          active={activeTool === 'roi'}
          onClick={() => setActiveTool('roi')}
        />
        <ToolCard 
          title="Templates Pitch" 
          description="Accédez aux présentations de vente et decks investisseurs."
          icon={<Presentation size={24} />}
          active={activeTool === 'pitch'}
          onClick={() => setActiveTool('pitch')}
        />
        <ToolCard 
          title="Études de Cas" 
          description="Démontrez vos succès passés avec des rapports détaillés."
          icon={<FileText size={24} />}
          active={activeTool === 'cases'}
          onClick={() => setActiveTool('cases')}
        />
        <ToolCard 
          title="Générateur de Devis" 
          description="Créez des estimations rapides pour vos solutions IA."
          icon={<Briefcase size={24} />}
          active={activeTool === 'quotes'}
          onClick={() => setActiveTool('quotes')}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {activeTool === 'roi' ? (
          <>
            <div className="lg:col-span-2 space-y-8 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <h2 className="flex items-center gap-3 text-xl font-semibold text-white">
                  <Calculator className="text-cyan-300" size={24} /> Simulateur de Rentabilité
                </h2>
                <div className="flex gap-1">
                  {[1, 2, 3].map(s => (
                    <div key={s} className={`w-8 h-1 rounded-full ${s <= step ? 'bg-cyan-400' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Entreprise Prospect</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Entreprise X"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500/40"
                        value={data.companyName}
                        onChange={(e) => setData({...data, companyName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Secteur</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Logistique"
                        className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500/40"
                        value={data.niche}
                        onChange={(e) => setData({...data, niche: e.target.value})}
                      />
                    </div>
                  </div>
                  <button onClick={() => setStep(2)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-900 transition hover:bg-slate-100">
                    Suivant <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Salaire Brut ($)</label>
                      <input 
                        type="number" 
                        className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 outline-none focus:border-cyan-500/40"
                        value={data.salaryMonthly}
                        onChange={(e) => setData({...data, salaryMonthly: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Heures Perdues / Sem.</label>
                      <input 
                        type="number" 
                        className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 outline-none focus:border-cyan-500/40"
                        value={data.hoursLostWeekly}
                        onChange={(e) => setData({...data, hoursLostWeekly: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-300 hover:bg-white/10">Retour</button>
                    <button onClick={() => setStep(3)} className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-900 hover:bg-slate-100">Continuer <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-3">
                    <Info size={18} className="text-orange-500 mt-0.5" />
                    <p className="text-xs text-orange-800 leading-relaxed italic">
                      Ces données permettent d'ajuster le "Cout d'Opportunité", l'un des leviers les plus puissants pour closer un contrat.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Valeur Contrat Moyen ($)</label>
                      <input 
                        type="number" 
                        className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 outline-none focus:border-cyan-500/40"
                        value={data.dealValue}
                        onChange={(e) => setData({...data, dealValue: Number(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">Leads Perdus / Mois</label>
                      <input 
                        type="number" 
                        className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-100 outline-none focus:border-cyan-500/40"
                        value={data.dealsLostMonthly}
                        onChange={(e) => setData({...data, dealsLostMonthly: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-300 hover:bg-white/10">Retour</button>
                    <button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer la Simulation'} <CheckCircle size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-8 text-white space-y-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <DollarSign size={120} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Rapport de Fuite de Capitaux</p>
              <h2 className="text-5xl font-black text-white">{Math.round(results.totalLeak).toLocaleString()} $ / an</h2>
              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><Clock size={16} /> Main d'œuvre gaspillée</span>
                  <span className="font-bold text-red-400">-{Math.round(results.directLaborCostAnnual).toLocaleString()} $</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><AlertTriangle size={16} /> Opportunités manquées</span>
                  <span className="font-bold text-red-400">-{Math.round(results.opportunityCostAnnual).toLocaleString()} $</span>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
                <h3 className="font-bold flex items-center gap-2 text-sm"><Zap size={16} /> Gain net potentiel</h3>
                <p className="text-3xl font-black mt-2">{Math.round(results.netAnnualGain).toLocaleString()} $</p>
                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-2 mt-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-900 transition hover:bg-slate-100">
                  <Download size={14} /> Télécharger PDF
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 rounded-[2.25rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h3 className="mb-6 flex items-center gap-2 text-sm font-bold text-white">
                <Clock size={18} className="text-slate-500" /> Historique des Simulations
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {simulations.map((sim) => (
                  <div key={sim.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-500/20 hover:bg-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm font-bold text-white">{sim.company_name}</p>
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">{sim.sector}</p>
                      </div>
                      <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
                        +{Math.round(sim.net_gain_annual).toLocaleString()} $
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[10px] text-slate-400">{new Date(sim.created_at).toLocaleDateString()}</span>
                      <button className="text-[10px] font-bold text-cyan-300 hover:underline">Charger</button>
                    </div>
                  </div>
                ))}
                {simulations.length === 0 && (
                  <p className="col-span-full py-10 text-center text-sm italic text-slate-400">Aucune simulation enregistrée.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="lg:col-span-3 rounded-[2.25rem] border border-white/10 bg-white/5 p-12 text-center space-y-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
              <Presentation size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Ressources en cours de synchronisation</h2>
              <p className="mx-auto mt-2 max-w-md text-slate-400">
                Nous préparons les templates de Pitch et les Études de Cas officiels pour votre secteur. Revenez bientôt !
              </p>
            </div>
            <button 
              onClick={() => setActiveTool('roi')}
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-300 transition hover:bg-white/10"
            >
              Retour au calculateur
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
