"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy, Printer, FileText, Sparkles } from 'lucide-react';
import DocumentReaderModal from '@/components/DocumentReaderModal';
import JobDescriptionSheet from '@/components/JobDescriptionSheet';
import { getJobDescription, jobDescriptionToMarkdown, jobDescriptions } from '@/lib/jobDescriptions';

export default function JobDescriptionDetailPage() {
  const params = useParams<{ slug: string }>();
  const job = getJobDescription(params?.slug || '') || jobDescriptions[0];
  const markdown = jobDescriptionToMarkdown(job);
  const [readerOpen, setReaderOpen] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_22%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.10),_transparent_18%),linear-gradient(180deg,_#050816_0%,_#090d19_100%)]" />
      <div className="relative z-10 mx-auto max-w-7xl space-y-8 p-6 md:p-8 print:p-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200 backdrop-blur">
              <Sparkles size={12} /> Fiche de poste
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">{job.title}</h1>
            <p className="text-sm text-slate-400">{job.summary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/job-descriptions" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
              <ArrowLeft size={16} /> Retour
            </Link>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
              <Copy size={16} /> Copier le texte
            </button>
            <button onClick={() => setReaderOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15">
              <FileText size={16} /> Lecture centrée
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
              <Printer size={16} /> Imprimer / PDF
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-transparent print:rounded-none print:border-none print:shadow-none">
          <JobDescriptionSheet job={job} />
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
