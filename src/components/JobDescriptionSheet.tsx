"use client";

import React from 'react';
import { JobDescription } from '@/lib/jobDescriptions';

type Props = {
  job: JobDescription;
};

export default function JobDescriptionSheet({ job }: Props) {
  return (
    <div className="mx-auto flex min-h-[1100px] max-w-[900px] flex-col border border-zinc-200 bg-white p-12 font-serif text-black shadow-xl print:border-none print:shadow-none">
      <header className="mb-10 flex items-start justify-between border-b-2 border-blue-900 pb-8">
        <div className="flex items-start gap-4">
          <img src="/icon-logo.png" alt="Logo OPAYS TECH" className="h-14 w-14 rounded-2xl object-contain shadow-sm" />
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-blue-900">OPAYS <span className="text-zinc-400">TECH</span></h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Infrastructure & Intelligence Artificielle</p>
            <div className="mt-4 text-xs leading-relaxed font-sans text-zinc-600">
              <p>Avenue de la Justice, Gombe</p>
              <p>Kinshasa, RD Congo</p>
              <p>contact@opays.tech | +243 000 000 000</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase text-zinc-800">{job.title}</h2>
          <p className="mt-1 text-sm font-bold text-zinc-500">Réf: {job.reference}</p>
          <p className="text-sm text-zinc-500">Titulaire: {job.holder}</p>
          <p className="text-sm text-zinc-500">Rôle HQ: {job.role}</p>
        </div>
      </header>

      <section className="mb-12 flex justify-between gap-8">
        <div className="w-full">
          <p className="mb-2 text-[10px] font-bold uppercase text-zinc-400 font-sans">Présentation du poste</p>
          <p className="text-sm leading-7 text-zinc-700">{job.presentation}</p>
        </div>
      </section>

      <main className="flex-1 space-y-8">
        {job.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 font-sans">{section.title}</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-800">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-900" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 font-sans">Indicateurs de performance</h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-800">
            {job.kpis.map((kpi) => (
              <li key={kpi} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                <span>{kpi}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 font-sans">Évolution du poste</h3>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-zinc-800">
            {job.evolution.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 font-sans">Conclusion</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-800">{job.conclusion}</p>
        </section>
      </main>

      <footer className="mt-16 border-t pt-10">
        <div className="flex items-end justify-between gap-8">
          <div className="text-[10px] font-sans leading-relaxed text-zinc-400">
            <p>Document interne Opays Tech</p>
            <p>Version imprimable / PDF</p>
            <p>Dernière mise à jour: 12 mai 2026</p>
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-bold uppercase text-zinc-400 font-sans">Validation Officielle</p>
            <div className="relative mx-auto h-32 w-32 opacity-90">
              <img src="/sceau-admin-opays.png" alt="Sceau Officiel OPAYS" className="h-full w-full object-contain" />
            </div>
            <p className="mt-2 text-[10px] font-bold text-zinc-600">La Direction Générale</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
