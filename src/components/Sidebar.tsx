"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const NavItem = ({ href, label, icon, active }: NavItemProps) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname();
  const isAssociate = profile?.type === 'ASSOCIATE';
  const canSeeTreasury = ['CEO', 'COO', 'ADMIN'].includes(profile?.role);
  const isManager = ['CEO', 'COO', 'CTO', 'ADMIN'].includes(profile?.role) || profile?.is_admin;

  const commonLinks = [
    { href: '/dashboard', label: 'Accueil', icon: <LayoutDashboard size={18} /> },
    { href: '/dashboard/studio', label: 'Outils de Vente', icon: <Target size={18} /> },
    { href: '/dashboard/projects', label: 'Mes Projets', icon: <Briefcase size={18} /> },
    { href: '/dashboard/knowledge', label: 'Guide & Savoir-faire', icon: <BookOpen size={18} /> },
    { href: '/dashboard/tasks', label: 'Mes Tâches', icon: <CheckCircle2 size={18} /> },
    { href: '/dashboard/ideas', label: 'Boîte à Idées', icon: <Lightbulb size={18} /> },
  ];

  const associateLinks = [
    { href: '/dashboard/leads', label: 'Mes Prospects', icon: <Users size={18} /> },
    { href: '/dashboard/equity', label: 'Mes Actions', icon: <TrendingUp size={18} /> },
    ...(canSeeTreasury ? [{ href: '/dashboard/treasury', label: 'Trésorerie', icon: <Wallet size={18} /> }] : []),
  ];

  const employeeLinks = [
    { href: '/dashboard/hr', label: 'Espace Employé', icon: <UserCircle size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col p-5 sticky top-0">
      <div className="mb-8 px-3 flex items-center gap-3">
        <img src="/icon-logo.png" alt="Opays Logo" className="w-9 h-9 rounded-xl shadow-sm" />
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">OPAYS <span className="text-gray-400">HQ</span></h2>
          <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Espace de travail</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 mb-2">Général</p>
        {commonLinks.map((link) => (
          <NavItem 
            key={link.href} 
            {...link} 
            active={pathname === link.href} 
          />
        ))}

        <div className="pt-5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 mb-2">
            {isAssociate ? 'Gestion Associé' : 'Espace Employé'}
          </p>
          {(isAssociate ? associateLinks : employeeLinks).map((link) => (
            <NavItem 
              key={link.href} 
              {...link} 
              active={pathname === link.href} 
            />
          ))}
        </div>

        {/* Paramètres = Centre de pilotage (visible pour managers/CEO) */}
        {isManager && (
          <div className="pt-5">
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest px-4 mb-2">Pilotage</p>
            <NavItem 
              href="/dashboard/settings" 
              label="Paramètres" 
              icon={<Settings size={18} />} 
              active={pathname === '/dashboard/settings'} 
            />
          </div>
        )}
      </nav>

      {/* Carte utilisateur cliquable → Mon Compte */}
      <div className="pt-4 border-t border-gray-100">
        <Link 
          href="/dashboard/profile"
          className={`block p-3 rounded-xl border transition-all ${
            pathname === '/dashboard/profile'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {profile?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold text-gray-900 truncate">{profile?.full_name || 'Utilisateur'}</p>
              <p className="text-[10px] text-gray-400 truncate">{profile?.role || 'Rôle'}</p>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
          </div>
        </Link>
      </div>
    </aside>
  );
}

