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
  ShieldCheck,
  CheckCircle2,
  Lightbulb
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
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-white text-black font-semibold shadow-lg shadow-white/5' 
        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </Link>
);

export default function Sidebar({ profile }: { profile: any }) {
  const pathname = usePathname();
  const isAssociate = profile?.type === 'ASSOCIATE';
  const canSeeTreasury = ['CEO', 'COO', 'ADMIN'].includes(profile?.role);

  const commonLinks = [
    { href: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/studio', label: 'Studio (Audits)', icon: <Target size={20} /> },
    { href: '/dashboard/projects', label: 'Projets', icon: <Briefcase size={20} /> },
    { href: '/dashboard/knowledge', label: 'Ficelles du métier', icon: <BookOpen size={20} /> },
    { href: '/dashboard/tasks', label: 'Mes Tâches', icon: <CheckCircle2 size={20} /> },
    { href: '/dashboard/ideas', label: 'Boîte à Idées', icon: <Lightbulb size={20} /> },
  ];

  const adminLinks = (profile?.role === 'CEO' || profile?.is_admin) ? [
    { href: '/dashboard/admin', label: 'Administration', icon: <ShieldCheck size={20} /> },
  ] : [];

  const associateLinks = [
    { href: '/dashboard/leads', label: 'Leads (CRM)', icon: <Users size={20} /> },
    { href: '/dashboard/equity', label: 'Mes Parts (Equity)', icon: <TrendingUp size={20} /> },
    ...(canSeeTreasury ? [{ href: '/dashboard/treasury', label: 'Trésorerie', icon: <Wallet size={20} /> }] : []),
  ];

  const employeeLinks = [
    { href: '/dashboard/hr', label: 'Mon Espace RH', icon: <UserCircle size={20} /> },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 h-screen flex flex-col p-6 sticky top-0">
      <div className="mb-10 px-4 flex items-center gap-3">
        <img src="/icon%20logo.PNG" alt="Opays Logo" className="w-8 h-8 rounded-lg shadow-lg" />
        <div>
          <h2 className="text-xl font-bold tracking-tighter">OPAYS <span className="text-zinc-500">HQ</span></h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Operating System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-4 mb-2">Général</p>
        {commonLinks.map((link) => (
          <NavItem 
            key={link.href} 
            {...link} 
            active={pathname === link.href} 
          />
        ))}

        <div className="pt-6">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest px-4 mb-2">
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

        {adminLinks.length > 0 && (
          <div className="pt-6">
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest px-4 mb-2">Gouvernance</p>
            {adminLinks.map((link) => (
              <NavItem 
                key={link.href} 
                {...link} 
                active={pathname === link.href} 
              />
            ))}
          </div>
        )}
      </nav>

      <div className="pt-6 border-t border-zinc-800">
        <NavItem 
          href="/dashboard/settings" 
          label="Paramètres" 
          icon={<Settings size={20} />} 
          active={pathname === '/dashboard/settings'} 
        />
        
        <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">
            {profile?.full_name?.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">{profile?.full_name || 'Utilisateur'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{profile?.role || 'Rôle'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
