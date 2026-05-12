"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Copy, FileText, Printer, Sparkles } from 'lucide-react';
import DocumentReaderModal from '@/components/DocumentReaderModal';
import { getJobDescription, jobDescriptionToMarkdown, jobDescriptions } from '@/lib/jobDescriptions';

export default function JobDescriptionsPage() {
  const [activeSlug, setActiveSlug] = useState(jobDescriptions[0].slug);
  const [readerOpen, setReaderOpen] = useState(false);
  const job = useMemo(() => getJobDescription(activeSlug) || jobDescriptions[0], [activeSlug]);

  const markdown = jobDescriptionToMarkdown(job);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)]" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-6 md:p-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
            <Sparkles size={12} /> Job Descriptions
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Fiches de poste Opays Tech</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-400">
            Chaque fiche est écrite pour être lue facilement, imprimée en PDF et partagée avec l’équipe. Le contenu suit la source de vérité de <code>docs/TEAM.md</code>.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-4">
            {jobDescriptions.map((item) => {
              const active = item.slug === activeSlug;
              return (
                <button
                  key={item.slug}
                  onClick={() => setActiveSlug(item.slug)}
                  className={`w-full rounded-[1.75rem] border p-5 text-left transition-all ${
                    active
                      ? 'border-cyan-400/30 bg-cyan-400/10 shadow-xl shadow-cyan-400/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{item.reference}</p>
                      <h2 className="mt-1 text-base font-semibold text-white">{item.title}</h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{item.holder} • {item.role}</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.summary}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          <section className="space-y-6">
            <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                    <BookOpen size={12} /> Lecture facile
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-white">{job.title}</h2>
                  <p className="text-sm leading-relaxed text-slate-400">{job.summary}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    <Copy size={16} /> Copier le texte
                  </button>
                  <button
                    onClick={() => setReaderOpen(true)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
                  >
                    <FileText size={16} /> Ouvrir en modale
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    <Printer size={16} /> Imprimer / PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Titulaire</p>
                  <p className="mt-2 text-sm font-semibold text-white">{job.holder}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Rôle HQ</p>
                  <p className="mt-2 text-sm font-semibold text-white">{job.role}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/50 p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Présentation du poste</h3>
                <p className="mt-3 text-sm leading-7 text-slate-200">{job.presentation}</p>
              </div>

              <div className="mt-6 space-y-6">
                {job.sections.map((section) => (
                  <div key={section.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">{section.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">KPIs</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                    {job.kpis.map((kpi) => (
                      <li key={kpi} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                        <span>{kpi}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Évolution</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">
                    {job.evolution.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl print:hidden">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Accès direct</h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {jobDescriptions.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/dashboard/job-descriptions/${item.slug}`}
                    className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-slate-200 transition hover:border-cyan-400/20 hover:bg-slate-950/70"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <DocumentReaderModal
        open={readerOpen}
        onClose={() => setReaderOpen(false)}
        title={job.title}
        subtitle={job.summary}
        content={markdown}
        badge="Fiche de poste"
        sourceLabel={job.holder}
        copyText={markdown}
      />
    </div>
  );
}
