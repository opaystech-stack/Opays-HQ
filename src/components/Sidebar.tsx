"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/lib/ProfileProvider';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  UserCircle, 
  Settings,
  Wallet,
  Target,
  CheckCircle2,
  Lightbulb,
  ChevronRight,
  Calendar,
  FileText,
  Monitor,
  FlaskConical,
  Radio,
  Palette,
  LogOut,
  Bell,
  Loader2,
  Sparkles
} from 'lucide-react';

interface NavItemProps {
  href: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}

const NavItem = ({ href, label, sublabel, icon, active, badge }: NavItemProps) => (
  <Link 
    href={href}
    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
      active 
        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-200'}>
      {icon}
    </div>
    <div className="flex flex-col flex-1">
      <span className="text-sm font-semibold leading-none">{label}</span>
      {sublabel && (
        <span className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${active ? 'text-blue-100/70' : 'text-slate-500'}`}>
          {sublabel}
        </span>
      )}
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full ${
        active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
      }`}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, checkAccess, logout, unreadCount, isAssociate, isManager, isCEO } = useProfile();

  if (!profile) {
    return (
      <aside className="w-72 bg-slate-950/80 border-r border-white/10 h-screen flex items-center justify-center sticky top-0">
        <Loader2 className="w-6 h-6 text-cyan-300 animate-spin" />
      </aside>
    );
  }

  const commonLinks = [
    { href: '/dashboard', label: 'Accueil', icon: <LayoutDashboard size={18} />, show: true },
    { href: '/dashboard/ai', label: 'Command Center', sublabel: 'Intelligence Artificielle', icon: <Sparkles size={18} />, show: true },
    { href: '/dashboard/projects', label: 'Nos Projets', sublabel: 'Livraison Client', icon: <Briefcase size={18} />, show: true },
    { href: '/dashboard/workspace', label: 'Workspace', sublabel: 'Ingénierie & Prod', icon: <Monitor size={18} />, show: checkAccess('workspace') },
    { href: '/dashboard/calendar', label: 'Calendrier', icon: <Calendar size={18} />, show: true },
    { href: '/dashboard/contracts', label: 'Contrats', icon: <FileText size={18} />, show: checkAccess('contracts') },
    { href: '/dashboard/documents', label: 'Modèles Doc.', sublabel: 'Factures & contrats', icon: <FileText size={18} />, show: isManager },
    { href: '/dashboard/job-descriptions', label: 'Fiches de poste', sublabel: 'Associés & rôles', icon: <BookOpen size={18} />, show: true },
    { href: '/dashboard/knowledge', label: 'Guide & Savoir-faire', icon: <BookOpen size={18} />, show: true },
    { href: '/dashboard/labs', label: 'Labs (R&D)', sublabel: 'Stratégie & Futur', icon: <FlaskConical size={18} />, show: checkAccess('labs') },
    { href: '/dashboard/tasks', label: 'Mes Tâches', icon: <CheckCircle2 size={18} />, show: true, badge: undefined },
    { href: '/dashboard/ideas', label: 'Boîte à Idées', icon: <Lightbulb size={18} />, show: true },
  ];

  const associateLinks = [
    { href: '/dashboard/studio', label: 'Outils de Vente', sublabel: 'Stratégie & ROI', icon: <Target size={18} />, show: checkAccess('studio') },
    { href: '/dashboard/leads', label: 'Mes Prospects', icon: <Users size={18} />, show: checkAccess('leads') },
    { href: '/dashboard/coordination', label: 'Command Center', sublabel: 'Coordination Comm', icon: <Radio size={18} />, show: checkAccess('coordination') },
    { href: '/dashboard/brand', label: 'Brand Assets', sublabel: 'Communication', icon: <Palette size={18} />, show: checkAccess('brand') },
    { href: '/dashboard/equity', label: 'Mes Actions', icon: <TrendingUp size={18} />, show: checkAccess('equity') },
    { href: '/dashboard/treasury', label: 'Trésorerie', icon: <Wallet size={18} />, show: checkAccess('treasury') },
  ];

  const employeeLinks = [
    { href: '/dashboard/hr', label: 'Espace Employé', icon: <UserCircle size={18} />, show: true },
  ];

  return (
    <aside className="w-72 bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 h-screen flex flex-col p-5 sticky top-0 text-slate-200 shadow-2xl shadow-black/30">
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent pointer-events-none" />
      <div className="mb-8 px-3 flex items-center gap-3 relative">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/20 flex items-center justify-center text-sm font-black text-white">
          O
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">OPAYS <span className="text-slate-400">HQ</span></h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.32em] font-semibold">Enterprise OS</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.32em] px-4 mb-2">Général</p>
        {commonLinks.filter(l => l.show).map((link) => (
          <NavItem 
            key={link.href} 
            {...link} 
            active={pathname === link.href} 
          />
        ))}

        <div className="pt-5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.32em] px-4 mb-2">
            {isAssociate ? 'Gestion Associé' : 'Espace Employé'}
          </p>
          {(isAssociate ? associateLinks : employeeLinks).filter(l => l.show).map((link) => (
            <NavItem 
              key={link.href} 
              {...link} 
              active={pathname === link.href} 
            />
          ))}
        </div>

        {/* Pilotage section (visible for managers/CEO) */}
        {isManager && (
          <div className="pt-5">
            <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.32em] px-4 mb-2">Pilotage</p>
            <NavItem 
              href="/dashboard/settings" 
              label="Paramètres" 
              icon={<Settings size={18} />} 
              active={pathname === '/dashboard/settings'} 
            />
          </div>
        )}
      </nav>

      {/* User card + notifications + logout */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        {/* Notification bar */}
        <Link 
          href="/dashboard/tasks"
          className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
            unreadCount > 0 
              ? 'bg-red-500/10 text-red-300 hover:bg-red-500/15' 
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <Bell size={16} />
          <span className="text-xs font-semibold flex-1">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''}` : 'Aucune notification'}
          </span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Link>

        {/* User profile card */}
        <Link 
          href="/dashboard/profile"
          className={`block p-3 rounded-xl border transition-all ${
            pathname === '/dashboard/profile'
              ? 'bg-white/10 border-cyan-400/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{profile.full_name || 'Utilisateur'}</p>
              <p className="text-[10px] text-slate-400 truncate">{profile.role || 'Rôle'}</p>
            </div>
            <ChevronRight size={14} className="text-slate-500" />
          </div>
        </Link>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={16} />
          <span className="text-xs font-semibold">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
